/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class bp_view implements view {

		NODE_R = 8;
		LEFT_AXIS_X = 300;
		RIGHT_AXIS_X = 700;
		BUNDLE_OFFSET = 150;
		GROUP_OFFSET = 150;
		AXIS_HEIGHT = 950;
		TOP_MARGIN = 50;
		GROUPBAR_WIDTH = 20;
		color = d3.scale.category10();

		optimize = false;
		
		cached_svg = null;


		public render(svg, w:bjs.world, c):void {
			
			this.cached_svg = svg;

			this.optimize = c["optimize"] > 0;

			var mv = this.prepareData(w, c);

			this.renderLinks(svg, mv);

			this.renderChain(svg, c, "lnodes", mv.lnodea, true, this.LEFT_AXIS_X);
			this.renderChain(svg, c, "rnodes", mv.rnodea, false, this.RIGHT_AXIS_X);

			if (this.optimize) {
				this.renderGroups(svg, c, "lgroups", {}, true, this.LEFT_AXIS_X - this.GROUP_OFFSET);
			}
			else {
				this.renderGroups(svg, c, "lgroups", mv.lgroups, true, this.LEFT_AXIS_X - this.GROUP_OFFSET);
			}
			this.renderGroups(svg, c, "rgroups", mv.rgroups, false, this.RIGHT_AXIS_X + this.GROUP_OFFSET);
		};


		private prepareData(w:bjs.world, c):bjs.mv {

			var mv = bjs.makeBipartite(this, w);

			if (this.optimize) {
				this.unilateralBipartiteSort(mv);
			}

			for (var i = 0; i < mv.lgroupa.length; ++i) {
				mv.lgroupa[i].x = this.LEFT_AXIS_X - this.GROUP_OFFSET;
			}

			for (var i = 0; i < mv.rgroupa.length; ++i) {
				mv.rgroupa[i].x = this.RIGHT_AXIS_X + this.GROUP_OFFSET;
			}

			for (var i = 0; i < mv.lnodea.length; ++i) {
				mv.lnodea[i].x = this.LEFT_AXIS_X;
			}

			for (var i = 0; i < mv.rnodea.length; ++i) {
				mv.rnodea[i].x = this.RIGHT_AXIS_X;
			}

			this.updateYValues(mv, c);

			return mv;
		}

		private updateYValues(mv:bjs.mv, c):void {
			this.setYValues(mv.lnodea, mv.lgroupa, "", !this.optimize);
			this.setYValues(mv.rnodea, mv.rgroupa, "", true);
		}


		private setYValues(nodes:bjs.node[], groups:bjs.group[], focusGroup:string, bSeparateGroups:boolean):void {

			if (nodes.length == 0) return;

			var numRegularNodes = 0,
				numFGNodes = 0,
				numBreaks = 0;

			var prevgroupname = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].group.fullname != prevgroupname) {
					if (bSeparateGroups) numBreaks += 1;
					prevgroupname = nodes[i].group.fullname;
				}
				if (nodes[i].group.fullname == focusGroup) {
					numFGNodes++;
				}
				else {
					numRegularNodes++;
				}
			}

			var interval = (this.AXIS_HEIGHT - this.TOP_MARGIN) / (numRegularNodes + (numBreaks) + (numFGNodes * 4));

			var y = this.TOP_MARGIN - interval / 2;
			var prevgroupname = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {

				y += interval;

				if (bSeparateGroups) {
					if (nodes[i].group.fullname != prevgroupname) {
						y += interval;
						prevgroupname = nodes[i].group.fullname;
					}

					if (nodes[i].group.fullname == focusGroup) {
						y += interval * 3;
					}
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



		//expects a mv that has lnodes and rnodes
		//uses brute force
		//leaves the rhs alone, only sorts the lhs
		private unilateralBipartiteSort(mv:bjs.mv):void {

			if (mv.lnodea.length < 2 || mv.rnodea.length < 2)
				return;

			var fr = new bjs.fastrandom();

			function swappem(nodes:bjs.node[], a:number, b:number) {
				var t = nodes[a];
				nodes[a] = nodes[b];
				nodes[b] = t;

				nodes[a].idx = a;
				nodes[b].idx = b;
			}

			function scorem(dat:bjs.mv):number {
				var score = 0;
				for (var i = 0; i < dat.links.length; ++i) {
					var linka = dat.links[i];
					for (var j = 0; j < dat.links.length; ++j) {
						var linkb = dat.links[j];

						var alpos = linka.source.idx / dat.lnodea.length;
						var arpos = linka.target.idx / dat.rnodea.length;

						var blpos = linkb.source.idx / dat.lnodea.length;
						var brpos = linkb.target.idx / dat.rnodea.length;

						if ((alpos > blpos) != (arpos > brpos)) {
							score++;
						}
					}
				}
				return score;
			}

			for (var i = 0; i < mv.lnodea.length; ++i) {
				mv.lnodea[i].idx = i;
			}

			for (var i = 0; i < mv.rnodea.length; ++i) {
				mv.rnodea[i].idx = i;
			}

			var score = scorem(mv);

			var d = new Date();
			var t = d.getTime();

			for (var i = 0; i < 10000; ++i) {
				if (new Date().getTime() - t > 5000) break;
				var l1, l2, r1, r2;
				l1 = Math.floor(fr.next(mv.lnodea.length));
				l2 = Math.floor(fr.next(mv.lnodea.length));

				swappem(mv.lnodea, l1, l2);

				var newscore = scorem(mv);

				if (newscore > score) {
					swappem(mv.lnodea, l1, l2);
				}
				else {
					score = newscore;
				}
			}

		}



		private renderLinks(svg, dat:bjs.mv):void {
			
			var bundle_offs = this.BUNDLE_OFFSET;

			var links = svg.selectAll(".link")
				.data(dat.links, function(d, i) {
					if (d.target == null || d.source == null)
						return "";
					return d.source.fullname + d.target.fullname;

				});


			links
				.enter()
				.append("path")
				.attr("class", "link")
				.attr("stroke",  bjs.getLinkColor);


			if (this.optimize) {
				links
					.transition()
					.attr("d", function(d) {
						return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
							"C " + (d.source.x + bundle_offs) + " " + d.source.y +
							" " + (d.target.x - bundle_offs) + " " + d.target.y +
							" " + d.target.x + " " + (d.target.y + Math.random() * 3);
					});
			}
			else {
				links
					.transition()
					.attr("d", function(d) {
						return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
							"C " + (d.source.x + bundle_offs) + " " + d.source.group.y +
							" " + (d.target.x - bundle_offs) + " " + d.target.group.y +
							" " + d.target.x + " " + (d.target.y + Math.random() * 3);
					});
			}

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderGroups(svg, conf, tag:string, data:bjs.IMap<group>, lefthanded:boolean, x:number) {

			var datarray = [];
			
			var color = this.color;//resolve 'this' at a good time. fuck's sake, javascript.

			for (var y in data) {
				datarray.push(data[y]);
			}

			var groups = svg.selectAll(".group." + tag)
				.data(datarray, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut);

			groupsg.append("rect");
			groupsg.append("line").attr("class", "grouplinetop group");
			groupsg.append("line").attr("class", "grouplinebottom group");;
			groupsg.append("text");

			groups.select("rect")
				.attr("x", x - this.GROUPBAR_WIDTH / 2)
				.attr("width", this.GROUPBAR_WIDTH)
				.style("fill", function(d) {
					return bjs.getGroupColor(color, conf, d);
				})
				.on("click", this.groupClick)
				.transition()
				.attr("y", function(d) {
					return d.topy;
				})
				.attr("height", function(d) {
					return d.bottomy - d.topy;
				});


			groups.select(".grouplinetop")
				.attr("x1", x)
				.attr("x2", x + (lefthanded ? this.GROUPBAR_WIDTH : -this.GROUPBAR_WIDTH))
				.transition()
				.attr("y1", function(d) {
					return d.topy;
				})
				.attr("y2", function(d) {
					return d.topy;
				});

			groups.select(".grouplinebottom")
				.attr("x1", x)
				.attr("x2", x + (lefthanded ? this.GROUPBAR_WIDTH : -this.GROUPBAR_WIDTH))
				.transition()
				.attr("y1", function(d) {
					return d.bottomy;
				})
				.attr("y2", function(d) {
					return d.bottomy;
				});

			groups.select("text")
				.attr("class", "grouplabel")
				.text(function(d) {
					return bjs.shortenString(d.fullname, 24);
				})
				.attr("x", x + (lefthanded ? -this.GROUPBAR_WIDTH : this.GROUPBAR_WIDTH))
				.attr("text-anchor", lefthanded ? "end" : "start")
				.transition()
				.attr("y", function(d, i) {
					return d.y;
				});

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, conf, tag:string, data:bjs.node[], lefthanded:boolean, x:number):void {
		
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

			nodesg.append("rect");
			nodesg.append("circle");
			nodesg.append("text");

			nodes.select("rect")
				.attr("class", "nodeinvis")
				.attr("x", function(d, i) {
					return d.x + (lefthanded ? -this.GROUP_OFFSET : 0);
				})
				.attr("width", function(d, i) {
					return this.GROUP_OFFSET;
				})
				.attr("height", function(d, i) {
					return 18;
				})
				.transition()
				.attr("y", function(d, i) {
					return d.y;
				});

			nodes.select("circle")
				.attr("class", "node")
				.attr("r", this.NODE_R)
				.attr("cx", function(d, i) {
					return d.x;
				})
				.style("fill", function(d) {
					return bjs.getNodeColor(color, conf, d);
				})
				.transition()
				.attr("cy", function(d, i) {
					return d.y;
				});

			nodes.select("text")
				.attr("class", "nodelabel")
				.text(function(d) {
					if(lefthanded && this.optimize) return d.field.fullname;
					return d.field.name;
				})
				.attr("x", function(d, i) {
					return d.x + (lefthanded ? -20 : 20);
				})
				.attr("text-anchor", lefthanded ? "end" : "start")
				.transition()
				.attr("y", function(d, i) {
					return d.y;
				});

			nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private linkMouseOver(d) {}

		private groupMouseOver(d) {
			var svg = d3.select("svg");//horrible, horrible.  javascript is a threat to mankind.
			svg.selectAll(".link")
				.classed("active", function(p) {
					return p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname);
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
					return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
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
			bjs.bp_view.focusGroup = d.fullname;
			bjs.bp_view.prepareData(data);
			bjs.bp_view.render(svg, info, data);
			*/
		}

	}

}

