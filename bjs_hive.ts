/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class hive_view implements view {

		NODE_R = 8;
		LEFT_AXIS_X = 200;
		MIDDLE_AXIS_X = 500;
		RIGHT_AXIS_X = 800;
		BUNDLE_OFFSET = 100;
		ROUP_OFFSET = 140;
		AXIS_HEIGHT = 950;
		TOP_MARGIN = 50;
		GROUPBAR_WIDTH = 20;
		GROUP_OFFSET = 80;
		color = d3.scale.category10();
		
		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;


		public render(svg, w:bjs.world, c):void {
			var mv = this.prepareData(w, c);
			this.svg = svg;
			this.config=c;
			this.mv=mv;

			this.renderLinks(svg, mv);

			this.renderChain(svg, c, "lnodes", mv.lnodea, bjs.handed.left, this.LEFT_AXIS_X);
			this.renderChain(svg, c, "rnodes", mv.rnodea, bjs.handed.right, this.RIGHT_AXIS_X);
			this.renderChain(svg, c, "m1nodes", mv.m1nodea, bjs.handed.left, this.MIDDLE_AXIS_X - this.GROUP_OFFSET / 2);
			this.renderChain(svg, c, "m2nodes", mv.m2nodea, bjs.handed.right, this.MIDDLE_AXIS_X + this.GROUP_OFFSET / 2);

			this.renderGroups(svg, c, "lgroups", mv.lgroupa, "left", this.LEFT_AXIS_X - this.GROUP_OFFSET);
			this.renderGroups(svg, c, "rgroups", mv.rgroupa, "right", this.RIGHT_AXIS_X + this.GROUP_OFFSET);
			this.renderGroups(svg, c, "mgroups", mv.mgroupa, "middle", this.MIDDLE_AXIS_X);
		}


		private prepareData(w:bjs.world, c):bjs.mv {


			var mv = bjs.makeTripartite(this, w);

			for (var i = 0; i < mv.lgroupa.length; ++i) {
				mv.lgroupa[i].x = this.LEFT_AXIS_X - this.GROUP_OFFSET;
			}

			for (var i = 0; i < mv.rgroupa.length; ++i) {
				mv.rgroupa[i].x = this.RIGHT_AXIS_X + this.GROUP_OFFSET;
			}

			for (var i = 0; i < mv.mgroupa.length; ++i) {
				mv.mgroupa[i].x = this.MIDDLE_AXIS_X;
			}

			for (var i = 0; i < mv.lnodea.length; ++i) {
				mv.lnodea[i].x = this.LEFT_AXIS_X;
			}

			for (var i = 0; i < mv.rnodea.length; ++i) {
				mv.rnodea[i].x = this.RIGHT_AXIS_X;
			}

			for (var i = 0; i < mv.m1nodea.length; ++i) {
				mv.m1nodea[i].x = this.MIDDLE_AXIS_X - this.GROUP_OFFSET / 2;
			}

			for (var i = 0; i < mv.m2nodea.length; ++i) {
				mv.m2nodea[i].x = this.MIDDLE_AXIS_X + this.GROUP_OFFSET / 2;
			}

			this.updateYValues(mv);

			return mv;
		}

		private updateYValues(mv) {
			this.setYValues(mv.rnodea, mv.rgroupa, "");
			this.setYValues(mv.lnodea, mv.lgroupa, "");
			this.setYValues(mv.m1nodea, mv.mgroupa, "");
			this.setYValues(mv.m2nodea, mv.mgroupa, "");
		}


		private setYValues(nodes:bjs.node[], groups:bjs.group[], focusGroup:string) {

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

			var interval = (this.AXIS_HEIGHT - this.TOP_MARGIN) / (numRegularNodes + (numBreaks * 2) + (numFGNodes * 4));

			var y = this.TOP_MARGIN - interval / 2;
			var prevgroup = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {

				y += interval;

				if (nodes[i].group.fullname != prevgroup) {
					y += interval;
					prevgroup = nodes[i].group.fullname;
				}

				if (nodes[i].group.fullname == focusGroup) {
					y += interval * 3;
				}

				nodes[i].y = y;
			}

			for (var j = 0; j < groups.length; ++j) {
				var p = groups[j];
				p.topy = 10000000;
				p.bottomy = 0;
				for (var i = 0; i < p.children.length; ++i) {
					if (p.children[i].y < p.topy) {
						p.topy = p.children[i].y;
					}
					if (p.children[i].y > p.bottomy) {
						p.bottomy = p.children[i].y;
					}
				}
				p.y = (p.topy + p.bottomy) / 2;
				p.topy -= interval - 2;
				p.bottomy += interval - 2;
				if (p.topy < this.TOP_MARGIN) p.topy = this.TOP_MARGIN;
				if (p.bottomy > this.AXIS_HEIGHT) p.bottomy = this.AXIS_HEIGHT;
			}
		}


		private renderLinks(svg, dat:bjs.mv):void {
			
			var bundle_offs = this.BUNDLE_OFFSET;

			var links = svg.selectAll(".link")
				.data(dat.links, function(d, i) {
					return d.source.fullname + d.target.fullname;
				});


			links
				.enter()
				.append("path")
				.attr("class", "link")
				.attr("stroke", bjs.getLinkColor);


			links
				.transition()
				.attr("d", function(d) {
					return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
						"C " + (d.source.x + bundle_offs) + " " + d.source.y +
						" " + (d.target.x - bundle_offs) + " " + d.target.y +
						" " + d.target.x + " " + (d.target.y + Math.random() * 3);
				});

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderGroups(svg, c, tag:string, data:bjs.group[], orientation:string, x:number):void {

			var datarray = data;

			var color = this.color;
			var config = this.config;
			var xoffset = 0;
			if (orientation == "left") xoffset = -this.GROUPBAR_WIDTH;
			if (orientation == "right") xoffset = this.GROUPBAR_WIDTH;
			var textanchor = "center";
			if (orientation == "left") textanchor = "end";
			if (orientation == "right") textanchor = "start";


			var groups = svg.selectAll(".group." + tag)
				.data(datarray, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut)
				.on("click", this.groupClick);

			groupsg.append("rect");
			groupsg.append("line").attr("class", "grouplinetop group");
			groupsg.append("line").attr("class", "grouplinebottom group");;
			groupsg.append("text");

			groups.select("rect")
				.attr("x", x - this.GROUPBAR_WIDTH / 2)
				.attr("width", this.GROUPBAR_WIDTH)
				.style("fill", function(d) {
					return bjs.getColorFromName(color, config, d.fullname);
				})
				.transition()
				.attr("y", function(d) {
					return d.topy;
				})
				.attr("height", function(d) {
					return d.bottomy - d.topy;
				});


			groups.select(".grouplinetop")
				.attr("x1", x)
				.attr("x2", x + xoffset)
				.transition()
				.attr("y1", function(d) {
					return d.topy;
				})
				.attr("y2", function(d) {
					return d.topy;
				});

			groups.select(".grouplinebottom")
				.attr("x1", x)
				.attr("x2", x + xoffset)
				.transition()
				.attr("y1", function(d) {
					return d.bottomy;
				})
				.attr("y2", function(d) {
					return d.bottomy;
				});

			if (orientation != "middle") {
				groups.select("text")
					.attr("class", "grouplabel")
					.text(function(d) {
						return bjs.shortenString(d.fullname, 24);
					})
					.attr("x", x + xoffset)
					.attr("text-anchor", textanchor)
					.transition()
					.attr("y", function(d, i) {
						return d.y;
					});
			}

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, config:bjs.config, tag:string, data, handed:bjs.handed, x:number):void {
		
			var color = this.color;

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter()
				.append("line")
				.attr("class", "axis " + tag)
				.attr("x1", x)
				.attr("y1", 0)
				.attr("x2", x)
				.attr("y2", this.AXIS_HEIGHT);

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
				
			bjs.drawNodes(nodesg, color, config, handed, this.NODE_R, true, false);
			
			var nodeupdate = nodes
				.transition()
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});


			var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private linkMouseOver(d) {}

		private groupMouseOver(d) {
			var svg = d3.select("svg");
			svg.selectAll(".link")
				.classed("active", function(p) {
					return p.source.pkgname == d.fullname || p.target.pkgname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.pkgname == d.fullname || p.target.pkgname == d.fullname);
				});

			svg.selectAll(".node")
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


			bjs.hover(d);
		}


		private nodeMouseOver(d) {
			var svg = d3.select("svg");
			svg.selectAll(".link")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d);
				})
				.classed("passive", function(p) {
					return !(bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d));
				});

			svg.selectAll(".node")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.areNodesRelated(p, d);
				});

			bjs.hover(d);
		}

		private mouseOut() {
		var svg = d3.select("svg");
			svg.selectAll(".passive").classed("passive", false);
			svg.selectAll(".active").classed("active", false);
			bjs.hover(null);
		}

		private groupClick(d) {
		/*
			bjs.hive_view.focusGroup = d.fullname;
			bjs.hive_view.prepareData(data);
			bjs.hive_view.render(svg, info, data);
			*/
		}


	}



}