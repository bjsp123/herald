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

		
		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;


		public render(svg, w:bjs.world, c:bjs.config):void {
			
			this.svg = svg;
			this.config=c;

			var mv = this.prepareData(w, c);
			this.mv = mv;

			this.renderLinks(svg, mv);

			this.renderChain(svg, c, "lnodes", mv.lnodea, this.LEFT_AXIS_X);
			this.renderChain(svg, c, "rnodes", mv.rnodea, this.RIGHT_AXIS_X);

			if (this.config.optimize) {
				this.renderGroups(svg, c, "lgroups", {});
			}
			else {
				this.renderGroups(svg, c, "lgroups", mv.lgroups);
			}
			this.renderGroups(svg, c, "rgroups", mv.rgroups);
		};


		private prepareData(w:bjs.world, c):bjs.mv {

			var mv = bjs.makeBipartite(this, w);

			if (this.config.optimize) {
				this.unilateralBipartiteSort(mv);
			}

			for (var i = 0; i < mv.lgroupa.length; ++i) {
				mv.lgroupa[i].x = this.LEFT_AXIS_X - this.GROUP_OFFSET;
				mv.lgroupa[i].handed = bjs.handed.left;
			}

			for (var i = 0; i < mv.rgroupa.length; ++i) {
				mv.rgroupa[i].x = this.RIGHT_AXIS_X + this.GROUP_OFFSET;
				mv.rgroupa[i].handed = bjs.handed.right;
			}

			for (var i = 0; i < mv.lnodea.length; ++i) {
				mv.lnodea[i].x = this.LEFT_AXIS_X;
				mv.lnodea[i].handed = bjs.handed.left;
			}

			for (var i = 0; i < mv.rnodea.length; ++i) {
				mv.rnodea[i].x = this.RIGHT_AXIS_X;
				mv.rnodea[i].handed = bjs.handed.right;
			}

			this.updateYValues(mv, c);

			return mv;
		}

		private updateYValues(mv:bjs.mv, c):void {
			this.setYValues(mv.lnodea, mv.lgroupa, "", !this.config.optimize);
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
				fitGroupToNodesBar(p, this.NODE_R, this.GROUP_OFFSET);
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


			if (this.config.optimize) {
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
							"C " + (d.source.x + bundle_offs) + " " + (d.source.group.y + d.source.group.height/2) +
							" " + (d.target.x - bundle_offs) + " " + (d.target.group.y + d.target.group.height/2) +
							" " + d.target.x + " " + (d.target.y + Math.random() * 3);
					});
			}

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderGroups(svg, conf, tag:string, data:bjs.IMap<group>) {

			var datarray = [];
			
			var color = this.color;//resolve 'this' at a good time. fuck's sake, javascript.
			var config = this.config;

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
				.style("opacity", 0)
				.attr("class", "group " + tag)
					.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut);
				
			bjs.drawGroupBar(groups, groupsg, this.color, this.config);
			
			var groupupdate = groups
				.transition()
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
				

			var groupexit = groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, conf, tag:string, data:bjs.node[], x:number):void {
		
			var color = this.color;
			var config = this.config;

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
				.style("opacity",0)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut);
				
			bjs.drawNodes(nodes, nodesg, color, config, this.NODE_R, true, (config.optimize && (x<400)));//approx way to decide whether to draw full name
			
			var nodeupdate = nodes
				.transition()
				.style("opacity",1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private linkMouseOver(d) {}

		private groupMouseOver(d) {
			d.view.svg.selectAll(".link")
				.classed("active", function(p) {
					return p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname);
				});

			d.view.svg.selectAll(".node")
				.classed("active", function(p) {
					return bjs.isNodeRelatedToGroup(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.isNodeRelatedToGroup(p, d);
				});

			d.view.svg.selectAll(".group")
				.classed("active", function(p) {
					return p.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return p.fullname != d.fullname;
				});


			bjs.hover(d);
		}


		private nodeMouseOver(d) {
			
			d.view.svg.selectAll(".link")
				.classed("active", function(p) {
					return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
				});

			d.view.svg.selectAll(".node")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.areNodesRelated(p, d);
				});

			bjs.hover(d);
		}

		private mouseOut(d) {
			d.view.svg.selectAll(".passive").classed("passive", false);
			d.view.svg.selectAll(".active").classed("active", false);
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

