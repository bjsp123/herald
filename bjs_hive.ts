/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_layout.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class hive_view implements view {

		
		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;
		focus:bjs.filter=null;
		dims:bjs.dimensions=null;


		left_axis_x:number;
		middle_axis_x:number;
		right_axis_x:number;


		public render(svg, w:bjs.world, c:config, f:filter, d:dimensions):void {
			this.dims=d;
			this.left_axis_x = this.dims.left_edge + 160;
			this.middle_axis_x = (this.dims.left_edge + this.dims.right_edge) / 2;
			this.right_axis_x = this.dims.right_edge - 160;
			
			this.svg = svg;
			this.config=c;
			this.focus=f;

			var mv = this.prepareData(w, c);
			this.mv=mv;
			
			this.renderLinks(svg, mv);

			this.renderChain(svg, c, "lnodes", mv.lnodea, bjs.handed.left, this.left_axis_x);
			this.renderChain(svg, c, "rnodes", mv.rnodea, bjs.handed.right, this.right_axis_x);
			this.renderChain(svg, c, "m1nodes", mv.m1nodea, bjs.handed.left, this.middle_axis_x - this.dims.groupbar_offs * .8);
			this.renderChain(svg, c, "m2nodes", mv.m2nodea, bjs.handed.right, this.middle_axis_x + this.dims.groupbar_offs * .8);

			this.renderGroups(svg, c, "lgroups", mv.lgroupa);
			this.renderGroups(svg, c, "rgroups", mv.rgroupa);
			this.renderGroups(svg, c, "mgroups", mv.mgroupa);
		}


		private prepareData(w:bjs.world, c):bjs.mv {

			var mv = bjs.makeTripartite(this, w, true);
			
			if(this.config.reorder){
				mv.lnodea.sort(firstBy("cookie"));
				mv.rnodea.sort(firstBy("cookie"));
				mv.m1nodea.sort(firstBy("cookie"));
				mv.m2nodea.sort(firstBy("cookie"));
			}
			
			var tooDarnBig:boolean = w.fielda.length > this.dims.big_limit;
			
			bjs.chainLayout(mv.rnodea, mv.rgroupa, this.right_axis_x, bjs.handed.right, true, this.dims.top_edge	, this.dims.bottom_edge	, this.dims.node_r	, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			bjs.chainLayout(mv.lnodea, mv.lgroupa, this.left_axis_x, bjs.handed.left, true, this.dims.top_edge	, this.dims.bottom_edge	, this.dims.node_r	, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			bjs.chainLayout(mv.m1nodea, mv.mgroupa, this.middle_axis_x - this.dims.groupbar_offs*.8, bjs.handed.left, true, this.dims.top_edge	, this.dims.bottom_edge	, this.dims.node_r	, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			bjs.chainLayout(mv.m2nodea, mv.mgroupa, this.middle_axis_x + this.dims.groupbar_offs*.8, bjs.handed.right, true, this.dims.top_edge	, this.dims.bottom_edge	, this.dims.node_r	, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);

			//manually move the middle group chain back into place.
			for(var i=0;i<mv.mgroupa.length; ++i){
				mv.mgroupa[i].handed = bjs.handed.none;
				mv.mgroupa[i].x = this.middle_axis_x - this.dims.groupbar_width/2;
			}
			
			if(tooDarnBig){
				for(var i=0;i<mv.lnodea.length;++i)
					mv.lnodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.rnodea.length;++i)
					mv.rnodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.m1nodea.length;++i)
					mv.m1nodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.m2nodea.length;++i)
					mv.m2nodea[i].handed = bjs.handed.none;
			}
			
			return mv;
		}

		
			
		private renderLinks(svg, dat:bjs.mv):void {
			
			var config = this.config;
			var focus = this.focus;
			
			var bundle_offs = this.dims.bundle_offs;

			var links = svg.selectAll(".link")
				.data(dat.links, function(d, i) {
					return d.source.fullname + d.target.fullname;
				});


			links
				.enter()
				.append("path")
				.attr("class", "link");


			links
				.transition(800)
				.attr("d", function(d) {return bjs.getLinkPath(d, bundle_offs, true, false);})
				.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);});

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderGroups(svg, c, tag:string, data:bjs.group[]):void {

			var datarray = data;
			

			var groups = svg.selectAll(".group." + tag)
				.data(datarray, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.style("opacity",0)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut)
				.on("click", this.groupClick);
				
			bjs.drawGroupBar(groups, groupsg, this.config);
			
			var groupupdate = groups
				.transition(800)
				.style("opacity",1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			var groupexit = groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, config:bjs.config, tag:string, data, handed:bjs.handed, x:number):void {
		

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
				
			bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, true, false);
			
			var nodeupdate = nodes
				.transition(800)
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
					return bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d);
				})
				.classed("passive", function(p) {
					return !(bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d));
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