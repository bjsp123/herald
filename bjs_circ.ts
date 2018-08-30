/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_layout.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class circ_view implements view {
		
		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;
		focus:bjs.filter=null;
		dims:bjs.dimensions=null;

		cx:number;
		cy:number;
		r1:number;
		r2:number;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
			
			this.svg = svg;
			this.config=c;
			this.focus = f;
			this.dims = d;

			this.cx = (this.dims.left_edge + this.dims.right_edge)/2;
			this.cy = (this.dims.top_edge + this.dims.bottom_edge)/2;

			this.r1 = this.cx - 300;
			this.r2 = this.r1 + this.dims.groupbar_offs;

			var mv = this.prepareData(w, c);
			this.mv = mv;

			for(var i=0;i<mv.nodea.length;++i){
				//linear to polar
				var n = mv.nodea[i];

				var oldx=n.x;
				n.x = Math.sin(oldx) * this.r1;
				n.y = Math.cos(oldx) * this.r1;
			}

			this.renderLinks(svg, mv);

			bjs.drawNodes(nodesel)
		};


		private prepareData(w:bjs.world, c):bjs.mv {
			
			var mv = bjs.makeDirect(this, w);
			
			var tooDarnBig = w.fielda.length > this.dims.big_limit;

			bjs.chainLayout(mv.nodea, mv.groupa, 0, bjs.handed.left, !this.config.optimize, 0, 360, this.dims.node_r, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			
			if(tooDarnBig){
				for(var i=0;i<mv.lnodea.length;++i)
					mv.lnodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.rnodea.length;++i)
					mv.rnodea[i].handed = bjs.handed.none;
			}
					
			return mv;
		}


		private renderNodes(svg:any, c:bjs.config, ndata:bjs.node[]):void {

			//var getNodePos = this.getNodePos;
			var xScale = this.xScale;
			var yScale = this.yScale;

			var nodes = svg
			.selectAll(".nodegrp")
			.data(ndata, function(d) {
				return d.fullname;
			});

			var nodesg = nodes
			.enter()
			.append("g")
			.attr("class", "nodegrp")
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.on("mouseover", this.nodeMouseOver)
			.on("mouseout", this.mouseOut);

			bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, false, false);

			var nodeupdate = nodes
			.transition().duration(this.dims.duration)
			.attr("transform", function(d) {
				var foo = "translate(" + d.x + "," + d.y + ")";
				return foo;
			});

			var nodeexit = nodes.exit().remove();

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

