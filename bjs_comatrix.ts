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

		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;


		public render(svg, w:bjs.world, c:bjs.config):void {
			var mv = this.prepareData(w, c);
			this.svg = svg;
			this.mv = mv;
			this.config=c;

			this.renderGroups(svg, "lgroups", mv.lgroupa, bjs.handed.column);
			this.renderGroups(svg, "rgroups", mv.rgroupa, bjs.handed.row);
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
			for(var i =0; i < mv.lgroupa.length;++i){
				mv.lgroupa[i].handed = bjs.handed.column;
			}
			for(var i =0; i < mv.rgroupa.length;++i){
				mv.rgroupa[i].handed = bjs.handed.row;
			}
			for(var i =0; i < mv.lnodea.length;++i){
				mv.lnodea[i].handed = bjs.handed.column;
			}
			for(var i =0; i < mv.rnodea.length;++i){
				mv.rnodea[i].handed = bjs.handed.row;
			}
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

				if(nodes[i].handed == bjs.handed.row) {
					nodes[i].x = offs;
					nodes[i].y = this.TOP_AXIS_Y;
				}else{
					nodes[i].y = offs;
					nodes[i].x = this.LEFT_AXIS_X;
				}
			}

			for (var j = 0; j < groups.length; ++j) {
				var p = groups[j];
				bjs.fitGroupToNodesBar(p, this.NODE_R, this.GROUP_OFFSET);
			}


		}

		private renderGroups(svg, tag, data:bjs.group[], handed:bjs.handed):void {

			var vert = (handed == bjs.handed.column);
			var fixedPos = (vert ? this.LEFT_AXIS_X : this.TOP_AXIS_Y) - this.GROUP_OFFSET;

			var groups = svg.selectAll(".group." + tag)
				.data(data, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.style("opacity", 0)
				.attr("class", "group " + tag)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut);
				
			groupsg.selectAll("g")
				.style("opacity",0)
				.transition().delay(1)
				.style("opacity", 1);
				
			var trans_fact = this.TRANSITION_FACTOR;

			
			bjs.drawGroupBar(groups, groupsg, this.config);
			
			var groupupdate = groups
				.transition().delay(function(d, i) {
					return Math.max(d.x,d.y) / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
				

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, tag:string, label:string, data:bjs.node[], handed:bjs.handed) {

			var vert = (handed == bjs.handed.column);
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
				.style("opacity", 0)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut);

			nodesg.append("line");

			var trans_fact = this.TRANSITION_FACTOR;
			var node_r = this.NODE_R;
			var config = this.config;
			var matrix_width = this.MATRIX_WIDTH;
			var matrix_height = this.MATRIX_WIDTH;

			nodes.select("line")
				.attr("style", function(d, i) {
					return "stroke-width:0.5;stroke:" + bjs.getNodeColor(config, d);
				}) // attr rather than style because it needs to override the css style
				.attr("class", "node")
				.on("mouseover", null)
				.on("mouseout", null)
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", function(d){return (d.handed==bjs.handed.row?0:matrix_width);})
				.attr("y2", function(d){return (d.handed==bjs.handed.row?matrix_height:0);});
				
				
			bjs.drawNodes(nodes, nodesg, config, this.NODE_R, false, false);
			
			var nodeupdate = nodes
				.transition().delay(function(d, i) {
					return Math.max(d.x,d.y) / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private renderPts(svg, data) {

			var pts = svg.selectAll(".pt")
				.data(data, function(d, i) {
					return d.key;
				});
				
			var getpc = this.getPtColor;
			var getpr = this.getPtRadius;
			var trans_fact = this.TRANSITION_FACTOR;

			var ptsg = pts
				.enter()
				.append("g")
				.attr("class", "pt")
				.style("opacity",0)
				.attr("transform", function(d) {
					return "translate(" + d.target.x + "," + d.source.y + ")";
				});

			ptsg.append("circle");

			
			pts.select("circle")
				.style("fill", function(d) {
					return getpc(d);
				})
				
				.attr("cx", 0)
				.attr("r", function(d) {
					return getpr(d);
				})
				.attr("cy", 0);

			pts
				.transition().delay(function(d, i) {
					return (Math.max(d.target.x,d.source.y)) / trans_fact;
				}).duration(this.TRANSITION_DURATION)
				.style("opacity",1)
				.attr("transform", function(d) {
					return "translate(" + d.target.x + "," + d.source.y + ")";
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
