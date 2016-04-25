/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var cola:any;

namespace bjs {

	export class block_view implements view {

		BLOCK_PADDING = 20;
		BLOCK_ROUNDY = 16;
		ARROW_WIDTH = 10;

		BLOCK_W = 14;
		BLOCK_SPACING = 28;
		LINK_LEN = 30;

		//cola vars
		coke = null;
		ghosts = null;
		eventStart = {};
		
		svg:any = null;
		config:bjs.config=null;
		mv: bjs.mv = null;
		focus: bjs.filter=null;
		dims:bjs.dimensions=null;



		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {

			this.config = c;
			this.svg=svg;
			this.focus=f;
			this.dims = d;

			var mv = bjs.makeColaBlockGraph(this, w, this.config);
			
			this.mv=mv;
			

			//have to manually remove everything or again cola gets confused.  no entry / exit animations for us!
			d3.selectAll("svg > *").remove();


			//add an arrowhead shape
			svg.append("svg:defs").selectAll("marker")
			    .data(["end"])      // Different link/path types can be defined here
			  .enter().append("svg:marker")    // This section adds in the arrows
			    .attr("id", String)
			    .attr("viewBox", "0 -5 10 10")
			    .attr("refX", 8)
			    .attr("refY", 0)
			    .attr("markerWidth", 6)
			    .attr("markerHeight", 6)
			    .attr("orient", "auto")
			  .append("svg:path")
			    .attr("d", "M0,-5L10,0L0,5");




			var constraints = [];

			mv.blocka.forEach(function(b) {
				b.width = d.node_r * this.BLOCK_W;
				b.height = d.node_r * (b.field_count + 10) / 2;
				b.padding = this.BLOCK_PADDING;
				b.x = Math.random() * 1000 - 500;
			}, this);



			for (var i = 0; i < mv.colalinks.length; ++i){
				var l = mv.colalinks[i];
				var con:any = { axis: "x", left: l.source, right: l.target, gap: d.node_r*this.BLOCK_SPACING };
				constraints.push(con);
			}

			//line up blocks that have a simple relationship
			for(var i=0;i<mv.colalinks.length; ++i){
				var l = mv.colalinks[i];
				if(Object.keys(l.realtarget.sources).length == 1 && Object.keys(l.realsource.targets).length == 1){
					var con:any = { axis: "y", left: l.source, right: l.target, gap: (l.realsource.height-l.realtarget.height)/2, equality: true};
					constraints.push(con);
				}
			}

			

			//omg omg
			this.coke = cola.d3adaptor()
				.linkDistance(d.node_r*this.LINK_LEN)
				.avoidOverlaps(true)
				.handleDisconnected(false)
				.size([this.dims.right_edge-this.dims.left_edge, this.dims.bottom_edge-this.dims.top_edge]);

			
			this.coke
				//.flowLayout('x', 300)
				.nodes(mv.blocka)
				.links(mv.colalinks)
				.constraints(constraints)
				.start(150, 130, 120);
			

			mv.groupa.forEach(function(g) {
				g.padding = this.GROUP_PADDING;
			},this);


			var xformbox = svg.selectAll("#colacontainer")
				.data([1])
				.enter()
				.append("g")
				.attr("id", "colacontainer")
				.attr("transform", "translate(" + this.dims.right_edge/2 + ", " + this.dims.bottom_edge/2 + ")");

			
			var config = this.config;
			var focus = this.focus;


			var lt = xformbox.selectAll(".link")
				.data(mv.colalinks, function(d) {
					return d.id;
				});

			/*
			lt.enter().append("path")
				.attr("class", "blocklink")
				.attr("stroke-width", function(d){return Math.min(16,Math.sqrt(d.count+6));})
				.attr("marker-end", "url(#end)")
				.attr("stroke", "black");
			*/
			lt.enter().append("path")
				.attr("class", "blocklink")
				.attr("stroke", "gray");

			lt.exit().remove();



			var blocks = xformbox.selectAll("g.block")
				.data(mv.blocka, function(d) {
					return d.fullname;
				});

			var blockg = blocks.enter()
				.append("g")
				.attr("class", "block")
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut); //.call(this.coke.drag); 

			bjs.drawBlocks(blocks, blockg, config, this.BLOCK_ROUNDY);

			var nodeexit = blocks.exit().remove();
			
			var fatarrow = this.fatarrow;
			var group_pad = this.BLOCK_PADDING;
			var node_r = this.dims.node_r;
			
			this.coke.on("tick", function() {

				lt.attr("d", fatarrow);

				blocks.attr("transform", function(d) {
					return "translate(" + (d.x) + "," + (d.y) + ")";
				});

			});


			var dragListener = d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", this.dragStart)
				.on("drag", this.drag)
				.on("dragend", this.dragEnd);

			blocks.call(dragListener);


		}


		private getEventPos() {
			var ev = d3.event;
			var e = typeof TouchEvent !== 'undefined' && ev.sourceEvent instanceof TouchEvent ? (ev.sourceEvent).changedTouches[0] : ev.sourceEvent;

			return {
				x: e.clientX,
				y: e.clientY
			};
		}

		private dragStart(d) {
			d.px = d.x, d.py = d.y; // set velocity to zero
			d.view.ghosts = [1, 2].map(function(i) {
				return d.view.svg.append('circle')
					.attr({
						class: 'ghost',
						cx: d.x+d.view.dims.right_edge/2+d.width/2,
						cy: d.y+d.view.dims.bottom_edge/2+d.height/2,
						r: d.width / 3
					});
			});
			d.view.eventStart[d.fullname] = d.view.getEventPos();
		}

		private getDragPos(d) {
			var p = d.view.getEventPos(),
				startPos = d.view.eventStart[d.fullname];
			return {
				cx: d.x + p.x - startPos.x,
				cy: d.y + p.y - startPos.y
			};
		}

		private drag(d) {
			var p = d.view.getDragPos(d);
			p.cx += d.view.dims.right_edge/2;
			p.cy += d.view.dims.bottom_edge/2;
			d.view.ghosts[1].attr(p);
		}

		private dragEnd(d) {
			d.view.ghosts.forEach(function(g) {
				return g.remove();
			},d.view);

			var dropPos = d.view.getDragPos(d);
			delete d.view.eventStart[d.fullname];

			d.x = dropPos.cx;
			d.y = dropPos.cy;

			d.fixed = true;
			d.view.coke.start(100, 20, 20);
			d.fixed = false;
		}


		//nodes are ranked so as to understand which 'attachment point' on a block to draw from.
		//getting markers etc to line up in svg is hard so we draw a whole arrow.
		private fatarrow(d, j):string {

			var lblock = d.realsource;
			var rblock = d.realtarget;

			var lx = lblock.x + lblock.width;
			var rx = rblock.x;

			var ly = lblock.y + lblock.height/2;
			var ry = rblock.y + rblock.height/2;

			var lcount = Object.keys(lblock.targets).length;
			var rcount = Object.keys(rblock.sources).length;

			var lrank=1, rrank=1;

			for (var v=0; v<lblock.targeta.length; ++v){
				if(lblock.targeta[v].y < rblock.y){
					lrank++;
				}
			}

			bjs.lg_warn("lrank " + lrank + " " + lblock.fullname + " " + rblock.fullname);

			for (var v=0; v<rblock.sourcea.length; ++v){
				if(rblock.sourcea[v].y < lblock.y){
					rrank++;
				}
			}

			ly = lblock.y;
			ly += lblock.height/(lcount+1)*lrank;


			ry = rblock.y;
			ry += rblock.height/(rcount+1)*rrank;

			var offs = Math.abs(rx - lx) / 2;

			/*
			return "M " + (lx) + " " + (ly) +
			"C " + (lx + offs) + " " + (ly) +
			" " + (rx - offs) + " " + (ry) +
			" " + (rx) + " " + (ry);
			*/
			var arrow_width = .5 * (d.count + 6);
			var head_width = arrow_width * 1.5;

			var rsx = rx - arrow_width * 1.5;

			var ribboncorrect = arrow_width*-1;
			if(ry > ly) ribboncorrect *= -1;

			var s = "";
			s += "M " + lx + " " + (ly-arrow_width);
			s += "C " + (lx+offs) + " "  + (ly-arrow_width) + " " + (rsx-offs+ribboncorrect) + " " + (ry-arrow_width) + " " + rsx + " " + (ry-arrow_width);
			s += "L " + rsx + " " + (ry-head_width);
			s += "L " + rx + " " + ry;
			s += "L " + rsx + " " + (ry+head_width);
			s += "L " + rsx + " " + (ry+arrow_width);
			s += "C " + (rsx-offs) + " " + (ry+arrow_width) + " " + (lx+offs-ribboncorrect) + " " + (ly+arrow_width) + " " + lx + " " + (ly+arrow_width); 
			s += " Z ";

			return s;
		}

		private groupMouseOver(d) {

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

			d.view.svg.selectAll(".node,.nodelabel")
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


	}


}
