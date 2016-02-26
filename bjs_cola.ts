/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var cola:any;
declare var svg:any;

namespace bjs {

	export class cola_view implements view {

		NODE_R = 8;
		TOTAL_WIDTH = 1600;
		TOTAL_HEIGHT = 1600;
		GROUP_PADDING = 20;
		GROUP_ROUNDY = 16;
		NODE_W = this.NODE_R * 8;
		NODE_H = this.NODE_R * 3.5;

		color = d3.scale.category20();

		optimize = false;

		data = {};

		//cola vars
		coke = null;
		ghosts = null;
		eventStart = {};



		public render(svg, w:bjs.world, c):void {

			this.optimize = c["this.optimize"] > 0;

			var mv = bjs.makeColaGraph(this, w);

			//have to manually remove everything or again cola gets confused.  no entry / exit animations for us!
			d3.selectAll("svg > *").remove();

			var powerGraph = null;

			//omg omg
			this.coke = cola.d3adaptor()
				.linkDistance(100)
				.avoidOverlaps(true)
				.handleDisconnected(false)
				.size([this.TOTAL_WIDTH, this.TOTAL_HEIGHT]);

			if (this.optimize) {
				this.coke
					.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.colalinks)
					.powerGraphGroups(function(d) {
						powerGraph = d;
					})
					.start(50, 30, 20);
			}
			else {
				this.coke
					.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.colalinks)
					.groups(mv.groupa)
					.start(50, 30, 20);
			}

			mv.nodea.forEach(function(v) {
				v.width = this.NODE_W; //CART_WIDTH+NODE_R/2;
				v.height = this.NODE_H; //CART_HEIGHT;
				v.x = v.x + this.TOTAL_WIDTH/3;
				v.y = v.y + this.TOTAL_WIDTH/3;
			}, this);

			mv.groupa.forEach(function(g) {
				g.padding = this.GROUP_PADDING;
			},this);

			if (powerGraph) {
				powerGraph.groups.forEach(function(g) {
					g.padding = this.GROUP_PADDING;
				},this);
				powerGraph.powerEdges.forEach(function(g) {
					g.id = g.source.fullname + ":" + g.target.fullname;
				},this);
			}


			var gt = svg.selectAll(".colagroup")
				.data(powerGraph ? powerGraph.groups : mv.groupa, function(d) {
					return d.id;
				});

			var gtg = gt.enter().append("g");
			
			var color = this.color;

			var gtr = gtg.append("rect")
				.attr("rx", this.GROUP_ROUNDY).attr("ry", this.GROUP_ROUNDY)
				.attr("class", "colagroup")
				.on("mouseover", this.groupMouseOver)
				.on("mouseout", this.mouseOut)
				.style("stroke", function(d, i) {
					return bjs.getGroupColor(color, c, d);
				});

			var gtc = gtg.append("text")
				.text(function(d) {
					return powerGraph ? "" : d.fullname;
				})
				.attr("text-anchor", "middle")
				.attr("class", "grouplabel")
				.style("fill", function(d) {
					return bjs.getGroupColor(color, c, d);
				});


			gt.exit().remove();


			var lt = svg.selectAll(".link")
				.data(powerGraph ? powerGraph.powerEdges : mv.colalinks, function(d) {
					return d.id;
				});

			lt.enter().append("path")
				.attr("class", "link")
				.attr("stroke", function(d) {
					if (powerGraph) return "green";
					return bjs.getLinkColor(d);
				});

			lt.exit().remove();

			var nt = svg.selectAll("g.nt")
				.data(mv.nodea, function(d) {
					return d.fullname;
				});

			var nodeEnter = nt.enter()
				.append("g")
				.attr("class", "nt")
				.on("mouseover", this.nodeMouseOver)
				.on("mouseout", this.mouseOut)
				.attr("transform", function(d) {
					return "translate(400,400)";
				}); //.call(this.coke.drag); 

			this.drawNode(c, nodeEnter);

			nt.exit().remove();
			
			var connector_colaroute = this.connector_colaroute;
			var connector_cubic = this.connector_cubic;
			var group_pad = this.GROUP_PADDING;
			var optimize = this.optimize;
			var node_r = this.NODE_R;
			
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
					lt.attr("d", connector_cubic);
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

				nt.attr("transform", function(d) {
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

			nt.call(dragListener);


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
				return svg.append('circle')
					.attr({
						class: 'ghost',
						cx: d.x,
						cy: d.y,
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

			return "M " + (d.source.x) + " " + (d.source.y) + "C " + (d.source.x + offs) + " " + (d.source.y) + " " + (d.target.x - offs) + " " + d.target.y + " " + d.target.x + " " + d.target.y;
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


		//expects an entry selection with a xlated g appended to it
		private drawNode(c, ne) {
			
			var color = this.color;

			ne.append("circle")
				.attr("r", this.NODE_R)
				.attr("class", "node")
				.style("fill", function(d) {
					return bjs.getNodeColor(color, c, d);
				});

			ne.append("text")
				.attr("x", 0)
				.attr("y", 15)
				.attr("text-anchor", "middle")
				.attr("class", "nodelabel")
				.text(function(d) {
					return d.field.name;
				});

		}


		private groupMouseOver(d) {
			
			/*
			svg.selectAll(".link")
				.classed("active", function(p) {
					return (p.realsource || p.source).group.fullname == d.fullname || (p.realtarget || p.target).group.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !((p.realsource || p.source).group.fullname == d.fullname || (p.realtarget || p.target).group.fullname == d.fullname);
				});

			svg.selectAll(".node")
				.classed("active", function(p) {
					return bjs.areNodesRelatedToGroup(p, d.pkg);
				})
				.classed("passive", function(p) {
					return !bjs.areNodesRelatedToGroup(p, d.pkg);
				});

			svg.selectAll(".colagroup")
				.classed("active", function(p) {
					return p.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return p.fullname != d.fullname;
				});
*/

			bjs.hover(d);
		}


		private nodeMouseOver(d) {
			
			svg.selectAll(".link")
			.classed("active", function(p) {
				return bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d);
			})
			.classed("passive", function(p) {
				return !(bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d));
			});

		svg.selectAll(".node,.nodelabel")
			.classed("active", function(p) {
				return bjs.areNodesRelated(p, d);
			})
			.classed("passive", function(p) {
				return !bjs.areNodesRelated(p, d);
			});

		bjs.hover(d);
		
		}

		private mouseOut() {
			svg.selectAll(".passive").classed("passive", false);
			svg.selectAll(".active").classed("active", false);
			bjs.hover(null);
		}


	}


}