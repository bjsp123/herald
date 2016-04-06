/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_layout.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class bp_view implements view {
		
		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;
		focus:bjs.filter=null;
		dims:bjs.dimensions=null;

		left_axis_x:number;
		right_axis_x:number;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
			
			this.svg = svg;
			this.config=c;
			this.focus = f;
			this.dims = d;

			this.left_axis_x = this.dims.left_edge + 250;
			this.right_axis_x = this.dims.right_edge - 250;

			var mv = this.prepareData(w, c);
			this.mv = mv;

			

			this.renderLinks(svg, mv);

			this.renderChain(svg, c, "lnodes", mv.lnodea, this.left_axis_x);
			this.renderChain(svg, c, "rnodes", mv.rnodea, this.right_axis_x);

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
			} else {
				if(this.config.reorder){
					mv.lnodea.sort(firstBy("cookie"));
					mv.rnodea.sort(firstBy("cookie"));
				}
			}
			
			var tooDarnBig = w.fielda.length > this.dims.big_limit;

			bjs.chainLayout(mv.lnodea, mv.lgroupa, this.left_axis_x, bjs.handed.left, !this.config.optimize, this.dims.top_edge, this.dims.bottom_edge, this.dims.node_r, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			bjs.chainLayout(mv.rnodea, mv.rgroupa, this.right_axis_x, bjs.handed.right, true, this.dims.top_edge, this.dims.bottom_edge, this.dims.node_r, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			
			if(tooDarnBig){
				for(var i=0;i<mv.lnodea.length;++i)
					mv.lnodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.rnodea.length;++i)
					mv.rnodea[i].handed = bjs.handed.none;
			}
					
			return mv;
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
			
			var bundle_offs = this.dims.bundle_offs;

			var links = svg.selectAll(".link")
				.data(dat.links, function(d, i) {
					if (d.target == null || d.source == null)
						return "";
					return d.source.fullname + d.target.fullname;

				});
				
			var config = this.config;
			var focus = this.focus;


			links
				.enter()
				.append("path")
				.attr("class", "link");


			if (this.config.optimize) {
				links
					.transition().duration(this.dims.duration)
					.attr("d", function(d) { return bjs.getLinkPath(d, bundle_offs, true, false);})
					.attr("stroke",  function(d){return bjs.getLinkColor(config, focus, d);});
			}
			else {
				links
					.transition().duration(this.dims.duration)
					.attr("d", function(d) { return bjs.getLinkPath(d, bundle_offs, true, true);})
					.attr("stroke",  function(d){return bjs.getLinkColor(config, focus, d);});
			}

			links
				.exit()
				.transition().duration(this.dims.duration).style("opacity", 0)
				.remove();
		}

		private renderGroups(svg, conf, tag:string, data:bjs.IMap<group>) {

			var datarray = [];

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
				
			bjs.drawGroupBar(groups, groupsg, this.config);
			
			var groupupdate = groups
				.transition().duration(this.dims.duration)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
				

			var groupexit = groups.exit().transition().duration(this.dims.duration).style("opacity", 0).remove();

		}

		private renderChain(svg, conf, tag:string, data:bjs.node[], x:number):void {
		

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter()
				.append("line")
				.attr("class", "axis " + tag)
				.attr("x1", x)
				.attr("y1", this.dims.top_edge)
				.attr("x2", x)
				.attr("y2", this.dims.bottom_edge);

			var nodes = svg
				.selectAll(".nodegrp." + tag)
				.data(data, function(d) {
					return d.fullname;
				});

			var nodesg = nodes
				.enter()
				.append("g")
				.attr("class", "nodegrp " + tag)
				.style("opacity",0)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut);
				
			bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, true, (this.config.optimize && (x<400)));//approx way to decide whether to draw full name
			
			var nodeupdate = nodes
				.transition().duration(this.dims.duration)
				.style("opacity",1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			var nodeexit = nodes.exit().transition().duration(this.dims.duration).style("opacity", 0).remove();

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

