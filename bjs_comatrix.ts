/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class cm_view implements view {

		NODE_R = 8;
		GROUPBAR_WIDTH = 20;
		GROUP_OFFSET = 100;
		MATRIX_WIDTH = 800;
		LEFT_AXIS_X = 200;
		TOP_AXIS_Y = 200;
		GROUP_PADDING = 20;
		CORNER_SPACE = 20;
		TRANSITION_FACTOR = 1;
		TRANSITION_DURATION = 500;
		color = d3.scale.category20();

		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;


		public render(svg, w:bjs.world, c:bjs.config):void {
			var mv = this.prepareData(w, c);
			this.svg = svg;
			this.mv = mv;
			this.config=c;

			this.renderGroups(svg, "lgroups", mv.lgroupa, "vertical");
			this.renderGroups(svg, "rgroups", mv.rgroupa, "horizontal");
			this.renderChain(svg, "lnodes", "Sources:", mv.lnodea, bjs.handed.column);
			this.renderChain(svg, "rnodes", "Outputs:", mv.rnodea, bjs.handed.row);

			this.renderPts(svg, mv.pts);
		}

		private prepareData(w:bjs.world, c):bjs.mv {

			//create l and r sets -- we'll use l for the y axis.
			var mv = bjs.makeBipartite(this, w);
			
			bjs.addPts(this, mv);

			this.layout(mv);

			return mv;

		}

		private layout(mv:bjs.mv):void {
			this.updateOffsValues(mv.lnodea, mv.lgroupa, "", this.TOP_AXIS_Y + this.CORNER_SPACE);
			this.updateOffsValues(mv.rnodea, mv.rgroupa, "", this.LEFT_AXIS_X + this.CORNER_SPACE);
		}

		private updateOffsValues(nodes:bjs.node[], groups:bjs.group[], focusGroup:string, startOffs:number):void {

			if (nodes.length == 0) return;

			var numRegularNodes = 0,
				numFGNodes = 0,
				numBreaks = 0;

			var prevgroup = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].group.fullname != prevgroup) {
					numBreaks += 1;
					prevgroup = nodes[i].group.fullname;
				}
				if (nodes[i].group.fullname == focusGroup) {
					numFGNodes++;
				}
				else {
					numRegularNodes++;
				}
			}

			var interval = (this.MATRIX_WIDTH) / (numRegularNodes + (numBreaks * 2) + (numFGNodes * 4));

			var offs = startOffs - interval / 2;
			var prevgroup = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {

				offs += interval;

				if (nodes[i].group.fullname != prevgroup) {
					offs += interval;
					prevgroup = nodes[i].group.fullname;
				}

				if (nodes[i].group.fullname == focusGroup) {
					offs += interval * 3;
				}

				nodes[i].offs = offs;
				//nodes[i].thickness = interval;

			}

			for (var j = 0; j < groups.length; ++j) {
				var p = groups[j];
				p.topoffs = 10000000;
				p.bottomoffs = 0;
				for (var i = 0; i < p.children.length; ++i) {
					if (p.children[i].offs < p.topoffs) {
						p.topoffs = p.children[i].offs;
					}
					if (p.children[i].offs > p.bottomoffs) {
						p.bottomoffs = p.children[i].offs;
					}
				}
				p.offs = (p.topoffs + p.bottomoffs) / 2;
				p.topoffs -= interval - 2;
				p.bottomoffs += interval - 2;
			}


		}

		private renderGroups(svg, tag, data:bjs.group[], orientation:string):void {

			var vert = (orientation == "vertical");
			var fixedPos = (vert ? this.LEFT_AXIS_X : this.TOP_AXIS_Y) - this.GROUP_OFFSET;

			var groups = svg.selectAll(".group." + tag)
				.data(data, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut);

			groupsg.append("rect").on("click", this.groupClick);
			groupsg.append("line").attr("class", "grouplinetop group");
			groupsg.append("line").attr("class", "grouplinebottom group");;
			groupsg.append("text");
			
			var trans_fact = this.TRANSITION_FACTOR;
			var group_width = this.GROUPBAR_WIDTH;
			
			var color = this.color;
			var config = this.config;

			groups.select("rect")
				.style("fill", function(d) {
					return bjs.getColorFromName(color, config, d.fullname);
				})
			.transition().delay(function(d, i) {
					return d.topoffs / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("x", vert ? (fixedPos - group_width / 2) : function(d) {
					return d.topoffs;
				})
				.attr("width", vert ? (group_width) : function(d) {
					return d.bottomoffs - d.topoffs;
				})
				.attr("y", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos - group_width / 2))
				.attr("height", vert ? function(d) {
					return d.bottomoffs - d.topoffs;
				} : (group_width));


			groups.select(".grouplinetop")
				.transition().delay(function(d, i) {
					return d.topoffs / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("x1", vert ? (fixedPos) : function(d) {
					return d.topoffs;
				})
				.attr("x2", vert ? (fixedPos + group_width) : function(d) {
					return d.topoffs;
				})
				.attr("y1", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos + group_width))
				.attr("y2", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos));

			groups.select(".grouplinebottom")
				.transition().delay(function(d, i) {
					return d.topoffs / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("x1", vert ? (fixedPos) : function(d) {
					return d.bottomoffs;
				})
				.attr("x2", vert ? (fixedPos + group_width) : function(d) {
					return d.bottomoffs;
				})
				.attr("y1", vert ? function(d) {
					return d.bottomoffs;
				} : (fixedPos + group_width))
				.attr("y2", vert ? function(d) {
					return d.bottomoffs;
				} : (fixedPos));

			groups.select("text")
				.attr("class", "grouplabel")
				.text(function(d) {
					return bjs.shortenString(d.fullname, 24);
				})
				.attr("text-anchor", vert ? "end" : "start")
				.attr("transform", vert ? function(d) {
					return "rotate(-45 " + (fixedPos - group_width) + " " + d.offs + ")";
				} : function(d) {
					return "rotate(-45 " + d.offs + " " + (fixedPos - group_width) + ")";
				})
				//.transition().delay(function(d,i){return i*100;}).duration(TRANSITION_DURATION)
				.attr("x", vert ? (fixedPos - group_width) : function(d) {
					return d.offs;
				})
				.attr("y", vert ? function(d, i) {
					return d.offs;
				} : (fixedPos - group_width));

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, tag:string, label:string, data:bjs.node[], handed:bjs.handed) {

			var vert = (orientation == "vertical");
			var fixedPos = (vert ? this.LEFT_AXIS_X : this.TOP_AXIS_Y);

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter().append("g");
				
			var group_width = this.GROUPBAR_WIDTH;

			axis.append("text");
			axis.append("line");

			axis.select("text")
				.text(label)
				.attr("class", "biglabel")
				.attr("text-anchor", vert ? "end" : "start")
				.attr("x", vert ? this.LEFT_AXIS_X - this.GROUP_OFFSET : this.LEFT_AXIS_X - this.GROUP_OFFSET)
				.attr("y", vert ? this.TOP_AXIS_Y : (this.TOP_AXIS_Y - this.GROUP_OFFSET));

			axis.select("line")
				.attr("class", "axis " + tag)
				.attr("x1", vert ? this.LEFT_AXIS_X : this.LEFT_AXIS_X)
				.attr("y1", vert ? this.TOP_AXIS_Y : this.TOP_AXIS_Y)
				.attr("x2", vert ? this.LEFT_AXIS_X : this.MATRIX_WIDTH + this.LEFT_AXIS_X)
				.attr("y2", vert ? this.MATRIX_WIDTH + this.TOP_AXIS_Y : this.TOP_AXIS_Y);

			var nodes = svg
				.selectAll(".node." + tag)
				.data(data, function(d) {
					return d.fullname;
				});

			var nodesg = nodes
				.enter()
				.append("g")
				.attr("class", "node " + tag)
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut);

			nodesg.append("line");
		

			var color = this.color;
			var trans_fact = this.TRANSITION_FACTOR;
			var node_r = this.NODE_R;
			var config = this.config;

			nodes.select("line")
				.attr("style", function(d, i) {
					return "stroke-width:0.5;stroke:" + bjs.getNodeColor(color, config, d);
				}) // attr rather than style because it needs to override the css style
				.on("mouseover", null)
				.on("mouseout", null)
				.transition().delay(function(d, i) {
					return d.offs / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("x1", vert ? fixedPos : function(d, i) {
					return d.offs;
				})
				.attr("y1", vert ? function(d, i) {
					return d.offs;
				} : fixedPos)
				.attr("x2", vert ? (this.MATRIX_WIDTH + this.LEFT_AXIS_X) : function(d, i) {
					return d.offs;
				})
				.attr("y2", vert ? function(d) {
					return d.offs;
				} : (this.MATRIX_WIDTH + this.TOP_AXIS_Y));


			nodes.select("circle")
				.attr("class", "node")
				.attr("r", this.NODE_R)
				.style("fill", function(d) {
					return bjs.getNodeColor(color, config, d);
				})
				.transition().delay(function(d, i) {
					return d.offs / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("cx", vert ? fixedPos : function(d, i) {
					return d.offs;
				})
				.attr("cy", vert ? function(d, i) {
					return d.offs;
				} : fixedPos);

			nodes.select("text")
				.attr("class", "nodelabel")
				.text(function(d) {
					return d.field.name;
				})
				.attr("text-anchor", vert ? "end" : "start")
				//.transition().delay(function(d,i){return d.offs/1000;}).duration(2000)
				.attr("transform", vert ? function(d) {
					return "rotate(-45 " + (fixedPos - group_width) + " " + d.offs + ")";
				} : function(d) {
					return "rotate(-45 " + d.offs + " " + (fixedPos - group_width) + ")";
				})

			.attr("x", vert ? (fixedPos - this.NODE_R * 2) : function(d, i) {
					return d.offs - node_r / 2;
				})
				.attr("y", vert ? function(d, i) {
					return d.offs + node_r;
				} : (fixedPos - this.NODE_R * 1.5)); //there is some subjective tuning in text position.



			var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private renderPts(svg, data) {

			var pts = svg.selectAll(".pt")
				.data(data, function(d, i) {
					return d.key;
				});

			var ptsg = pts
				.enter()
				.append("g")
				.attr("class", "pt");

			ptsg.append("circle");

			var getpc = this.getPtColor;
			var getpr = this.getPtRadius;
			var trans_fact = this.TRANSITION_FACTOR;
			
			pts.select("circle")
				.style("fill", function(d) {
					return getpc(d);
				})
				.transition().delay(function(d, i) {
					return (d.target.offs) / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.attr("cx", function(d) {
					return d.target.offs;
				})
				.attr("r", function(d) {
					return getpr(d);
				})
				.attr("cy", function(d) {
					return d.source.offs;
				});


			pts.exit().transition(800).style("opacity", 0).remove();
		}

		private getPtRadius(pt) {
			if (pt.depth == 0) {
				return pt.view.NODE_R * 0.8;
			}

			if (pt.depth == 1) {
				return pt.view.NODE_R * 0.66;
			}
			return pt.view.NODE_R * 0.45;
		}

		private getPtColor(pt) {
			if (pt.depth == 0) {
				return "#31a354";
			}

			if (pt.depth == 1) {
				return "#78c679";
			}
			return "#addd8e";
		}

		private groupClick(d) {
		}


		// not currently used -- not sure what there is to do that's useful when user hovers over a point
		private ptMouseOver(d) {
			svg.selectAll(".node,.nodelabel")
				.classed("active", function(p) {
					return p.fullname == d.source.fullname || p.fullname == d.target.fullname;
				})
				.classed("passive", function(p) {
					return !(p.fullname == d.source.fullname || p.fullname == d.target.fullname);
				});

			svg.selectAll(".pt")
				.classed("active", function(p) {
					return p.source.fullname == d.source.fullname || p.target.fullname == d.target.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.fullname == d.source.fullname || p.target.fullname == d.target.fullname);
				});
		}

		private groupMouseOver(d) {

			svg.selectAll(".node,.nodelabel")
				.classed("active", function(p) {
					return bjs.isNodeRelatedToGroup(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.isNodeRelatedToGroup(p, d);
				});

			svg.selectAll(".group")
				.classed("active", function(p) {
					return p.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return p.fullname != d.fullname;
				});

			svg.selectAll(".pt")
				.classed("active", function(p) {
					return p.sourcepkg.fullname == d.fullname || p.targetpkg.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.sourcepkg.fullname == d.fullname || p.targetpkg.fullname == d.fullname);
				});


			bjs.hover(d);
		}


		private nodeMouseOver(d) {

			d.view.svg.selectAll(".node,.nodelabel")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.areNodesRelated(p, d);
				});

			d.view.svg.selectAll(".pt")
				.classed("active", function(p) {
					return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
				});

			bjs.hover(d);
		}

		private mouseOut(d) {
			d.view.svg.selectAll(".passive").classed("passive", false);
			d.view.svg.selectAll(".active").classed("active", false);
			bjs.hover(null);
		}

	}

}
