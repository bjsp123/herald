/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var cola:any;

namespace bjs {

	export class cola_view implements view {

		GROUP_PADDING = 20;
		GROUP_ROUNDY = 16;
		
		node_w:number;
		node_h:number;


		optimize = false;

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

			this.optimize = c.optimize;

			this.config = c;
			this.svg=svg;
			this.focus=f;
			this.dims = d;

			var mv = bjs.makeColaGraph(this, w, this.config);
			
			this.mv=mv;
			

			this.node_w = this.dims.node_r * 8;
			this.node_h = this.dims.node_r * 3.5;

			//have to manually remove everything or again cola gets confused.  no entry / exit animations for us!
			d3.selectAll("svg > *").remove();

			var powerGraph = null;

			var constraints = [];

			for(var i=0;i<mv.nodea.length;++i){
				mv.nodea[i].x = mv.nodea[i].field.ldepth * 150;
			}

			for (var i = 0; i < mv.groupa.length; ++i){
				var con:any = { type: "alignment", axis: "x", offsets: [] };
				for (var j = 0; j < mv.groupa[i].children.length; ++j){
					con.offsets.push({ node: mv.groupa[i].children[j].cola_index, offset: 0 });
				}
				//constraints.push(con);
			}

			for (var i = 0; i < mv.colalinks.length; ++i){
				var l = mv.colalinks[i];
				var con:any = { axis: "x", left: l.source, right: l.target, gap: 150 };
				constraints.push(con);
			}


			//omg omg
			this.coke = cola.d3adaptor()
				//.linkDistance(200)
				.avoidOverlaps(true)
				.handleDisconnected(false)
				.size([this.dims.right_edge-this.dims.left_edge, this.dims.bottom_edge-this.dims.top_edge]);

			if (this.optimize) {
				this.coke
					//.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.colalinks)
					.constraints(constraints)
					.powerGraphGroups(function(d) {
						powerGraph = d;
					})
					.start(150, 130, 120);
			}
			else {
				this.coke
					//.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.colalinks)
					.groups(mv.groupa)
					.constraints(constraints)
					.start(150, 130, 120);
			}

			mv.nodea.forEach(function(v) {
				v.width = this.node_w; //CART_WIDTH+dims.node_r/2;
				v.height = this.node_h; //CART_HEIGHT;
			}, this);

			mv.groupa.forEach(function(g) {
				g.padding = this.GROUP_PADDING;
			},this);

			if (powerGraph) {
				powerGraph.groups.forEach(function(g) {
					g.padding = this.GROUP_PADDING;
				},this);
				powerGraph.powerEdges.forEach(function(g) {
					g.id = this.makeIdForGroup(g);
				},this);
			}

			var xformbox = svg.selectAll("#colacontainer")
				.data([1])
				.enter()
				.append("g")
				.attr("id", "colacontainer")
				.attr("transform", "translate(" + this.dims.right_edge/2 + ", " + this.dims.bottom_edge/2 + ")");

			var gt = xformbox.selectAll(".colagroup")
				.data(powerGraph ? powerGraph.groups : mv.groupa, function(d) {
					return d.id;
				});

			var gtg = gt.enter()
			.append("g")
			.attr("class", "group");
			
			var config = this.config;
			var focus = this.focus;

			bjs.drawGroupBox(gt, gtg, this.config, this.GROUP_ROUNDY);


			var gtr = gt.select("rect");
			var gtc = gt.select("text");

			var groupexit = gt.exit().remove();

			var lt = xformbox.selectAll(".link")
				.data(powerGraph ? powerGraph.powerEdges : mv.colalinks, function(d) {
					return d.id;
				});

			lt.enter().append("path")
				.attr("class", "link")
				.attr("stroke", function(d) {
					if (powerGraph) return "green";
					return bjs.getLinkColor(config, focus, d);
				});

			lt.exit().remove();

			var nodes = xformbox.selectAll("g.nt")
				.data(mv.nodea, function(d) {
					return d.fullname;
				});

			var nodesg = nodes.enter()
				.append("g")
				.attr("class", "nt")
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut); //.call(this.coke.drag); 

			bjs.drawNodes(nodes, nodesg, config, focus, this.dims.node_r, false, false);

			var nodeexit = nodes.exit().remove();
			
			var connector_colaroute = this.connector_colaroute;
			var connector_cubic = this.connector_cubic;
			var group_pad = this.GROUP_PADDING;
			var optimize = this.optimize;
			var node_r = this.dims.node_r;
			
			this.coke.on("tick", function() {

				if (optimize) {
					lt.each(function(d) {
						var srcInner = d.source.bounds.inflate(-group_pad);
						var tgtInner = d.target.bounds.inflate(-group_pad);
						d.route = cola.vpsc.makeEdgeBetween(srcInner, tgtInner, 0);
					});

					lt.attr("d", connector_colaroute);

				}
				else {
					lt.attr("d", connector_cubic)
					.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);});
				}

				gtr.attr("x", function(d) {
						return d.bounds.x + group_pad / 2;
					})
					.attr("y", function(d) {
						return d.bounds.y + group_pad / 2;
					})
					.attr("width", function(d) {
						return d.bounds.width() - group_pad;
					})
					.attr("height", function(d) {
						return d.bounds.height() - group_pad;
					});

				gtc.attr("x", function(d) {
						return d.bounds.x + d.bounds.width() / 2;
					})
					.attr("y", function(d) {
						return d.bounds.y + d.bounds.height() + node_r / 4;
					});

				nodes.attr("transform", function(d) {
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

			nodes.call(dragListener);


		}

		private makeIdForGroup(g: any):string {
			var id = "";

			if(g.source.fullname != null) {
				id += g.source.fullname;
			}else{
				for(var i= 0;i<g.source.leaves.length;++i){
					id+="s"+g.source.leaves[i].cola_index;
				}
			}

			id += ":";

			if (g.target.fullname != null) {
				id += g.target.fullname;
			} else {
				for (var i = 0; i < g.target.leaves.length; ++i) {
					id += "t"+g.target.leaves[i].cola_index;
				}
			}

			return id;
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
						cx: d.x+d.view.dims.right_edge/2,
						cy: d.y+d.view.dims.bottom_edge/2,
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



		private connector_cubic(d, i) {

			var offs = Math.abs(d.source.x - d.target.x) / 2;

			return bjs.getLinkPath(d, offs, false, false);
		}

		private connector_colaroute(d, i) {

			var x1 = d.route.sourceIntersection.x;
			var y1 = d.route.sourceIntersection.y;
			var x2 = d.route.arrowStart.x;
			var y2 = d.route.arrowStart.y;

			var offs = Math.abs(x1 - x2) / 2;

			//return "M " + x1 + " " + y1 + " L " + x2 + " " + y2;

			return "M " + (x1) + " " + (y1) + "C " + (x1 + offs) + " " + (y1) + " " + (x2 - offs) + " " + y2 + " " +x2 + " " + y2;

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
