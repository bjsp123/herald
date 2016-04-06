/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_layout.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class cm_view implements view {

		GROUP_PADDING = 20;
		CORNER_SPACE = 20;
		TRANSITION_FACTOR = 2;

		svg:any = null;
		config:bjs.config=null;
		mv:bjs.mv=null;
		focus:bjs.filter=null;
		dims:bjs.dimensions=null;

		left_axis_x:number;
		top_axis_y:number;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
			
			this.dims = d;
			this.left_axis_x = this.dims.left_edge + this.dims.groupbar_offs * 1.5;
			this.top_axis_y = this.dims.top_edge + this.dims.groupbar_offs * 1.5;

			this.svg = svg;
			this.config=c;
			this.focus=f;
			var mv = this.prepareData(w, c);
			this.mv = mv;

			this.renderGroups(svg, "lgroups", mv.lgroupa, bjs.handed.column);
			this.renderGroups(svg, "rgroups", mv.rgroupa, bjs.handed.row);
			this.renderChain(svg, "lnodes", "Sources:", mv.lnodea, bjs.handed.column);
			this.renderChain(svg, "rnodes", "Outputs:", mv.rnodea, bjs.handed.row);

			this.renderPts(svg, mv.pts);
		}

		private prepareData(w:bjs.world, c):bjs.mv {

			//create l and r sets -- we'll use l for the y axis.
			var mv = bjs.makeBipartite(this, w);
			
			if(this.config.reorder){
				mv.lnodea.sort(firstBy("cookie"));
				mv.rnodea.sort(firstBy("cookie"));
			}
			
			bjs.addPts(this, mv, this.config);

			var tooDarnBig:boolean = w.fielda.length > this.dims.big_limit;

			bjs.chainLayout(mv.lnodea, mv.lgroupa, this.left_axis_x, bjs.handed.column, true, this.top_axis_y + this.CORNER_SPACE, this.dims.bottom_edge, this.dims.node_r, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			bjs.chainLayout(mv.rnodea, mv.rgroupa, this.top_axis_y, bjs.handed.row, true, this.left_axis_x + this.CORNER_SPACE, this.dims.right_edge, this.dims.node_r, this.dims.groupbar_offs, tooDarnBig?0:this.dims.node_r);
			
			if(tooDarnBig){
				for(var i=0;i<mv.lnodea.length;++i)
					mv.lnodea[i].handed = bjs.handed.none;
				for(var i=0;i<mv.rnodea.length;++i)
					mv.rnodea[i].handed = bjs.handed.none;
			}
			
			return mv;

		}


		private renderGroups(svg, tag, data:bjs.group[], handed:bjs.handed):void {

			var vert = (handed == bjs.handed.column);
			var fixedPos = (vert ? this.left_axis_x : this.top_axis_y) - this.dims.groupbar_offs;

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
				}).duration(this.dims.duration)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
				

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		private renderChain(svg, tag:string, label:string, data:bjs.node[], handed:bjs.handed) {

			var vert = (handed == bjs.handed.column);
			var fixedPos = (vert ? this.left_axis_x : this.top_axis_y);

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter().append("g");
				
			var group_width = this.dims.groupbar_width;

			axis.append("text");
			axis.append("line");

			axis.select("text")
				.text(label)
				.attr("class", "biglabel")
				.attr("text-anchor", vert ? "end" : "start")
				.attr("x", vert ? this.left_axis_x - this.dims.groupbar_offs : this.left_axis_x - this.dims.groupbar_offs)
				.attr("y", vert ? this.top_axis_y : (this.top_axis_y - this.dims.groupbar_offs));

			axis.select("line")
				.attr("class", "axis " + tag)
				.attr("x1", vert ? this.left_axis_x : this.left_axis_x)
				.attr("y1", vert ? this.top_axis_y : this.top_axis_y)
				.attr("x2", vert ? this.left_axis_x : this.dims.right_edge)
				.attr("y2", vert ? this.dims.bottom_edge : this.top_axis_y);

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
			var node_r = this.dims.node_r;
			var config = this.config;
			var focus = this.focus;
			var left_axis_x = this.left_axis_x;
			var top_axis_y = this.top_axis_y;
			var right_edge = this.dims.right_edge;
			var bottom_edge = this.dims.bottom_edge;

			nodes.select("line")
				.attr("class", "nodehairline")
				.attr("stroke", function(d){return bjs.getNodeColor(config, focus, d);})
				.on("mouseover", null)
				.on("mouseout", null)
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", function(d){return (d.handed==bjs.handed.row?0:right_edge-left_axis_x);})
				.attr("y2", function(d){return (d.handed==bjs.handed.row?bottom_edge-top_axis_y:0);});
				
				
			bjs.drawNodes(nodes, nodesg, config, focus, this.dims.node_r, false, false);
			
			var nodeupdate = nodes
				.transition().delay(function(d, i) {
					return Math.max(d.x,d.y) / trans_fact;
				}).duration(this.dims.duration)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

		}

		private renderPts(svg:any, data:bjs.pt[]):void {

			var config = this.config;
			var focus = this.focus;
			var noder = this.dims.node_r;

			var pts = svg.selectAll(".pts")
				.data(data, function(d, i) {
					return d.key;
				});
				
			var trans_fact = this.TRANSITION_FACTOR;

			var ptsg = pts
				.enter()
				.append("g")
				.attr("class", "pts")
				.style("opacity",0)
				.attr("transform", function(d) {
					return "translate(" + d.target.x + "," + d.source.y + ")";
				});

			ptsg.append("rect");

			
			pts.select("rect")
				.style("fill", function(d) {
					return bjs.getPtColor(config, focus, d);
				})
				.attr("class", "pt")
				.attr("x", -noder*.75)
				.attr("y", -noder*.75)
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("width", noder*1.5)
				.attr("height", noder*1.5)
				.on("mouseover", this.ptMouseOver);

			pts
				.transition().delay(function(d, i) {
					return (Math.max(d.target.x,d.source.y)) / trans_fact;
				}).duration(this.dims.duration)
				.style("opacity",1)
				.attr("transform", function(d) {
					return "translate(" + d.target.x + "," + d.source.y + ")";
				});

			pts.exit().transition(800).style("opacity", 0).remove();
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

			bjs.hover(d);
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
					//return bjs.areNodesRelated(p, d);
					return p.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					//return !bjs.areNodesRelated(p, d);
					return p.fullname != d.fullname;
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
