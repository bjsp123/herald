/* global d3 */

var bjs;
(function(bjs) {

	bjs.cola_view = function() {

		var NODE_R = 8;
		var TOTAL_WIDTH = 1600;
		var TOTAL_HEIGHT = 1600;
		var GROUP_PADDING = 20;
		var GROUP_ROUNDY = 16;
		var NODE_W = NODE_R * 8;
		var NODE_H = NODE_R * 3.5;

		var color = d3.scale.category20();

		var optimize = 0;

		var data = {};

		//cola vars
		var coke = null;
		var ghosts = null;
		var eventStart = {};



		bjs.cola_view.render = function(svg, w, c) {

			optimize = c["optimize"] > 0;

			var mv = bjs.makeColaGraph(w, bjs.cola_view.colorPlan);

			//have to manually remove everything or again cola gets confused.  no entry / exit animations for us!
			d3.selectAll("svg > *").remove();

			var powerGraph = null;

			//omg omg
			coke = cola.d3adaptor()
				.linkDistance(100)
				.avoidOverlaps(true)
				.handleDisconnected(false)
				.size([TOTAL_WIDTH, TOTAL_HEIGHT]);

			if (optimize) {
				coke
					.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.links)
					.powerGraphGroups(function(d) {
						powerGraph = d;
					})
					.start(50, 30, 20);
			}
			else {
				coke
					.flowLayout('x', 300)
					.nodes(mv.nodea)
					.links(mv.links)
					.groups(mv.groupa)
					.start(50, 30, 20);
			}

			mv.nodea.forEach(function(v) {
				v.width = NODE_W; //CART_WIDTH+NODE_R/2;
				v.height = NODE_H; //CART_HEIGHT;
			});

			mv.groupa.forEach(function(g) {
				g.padding = GROUP_PADDING;
			});

			if (powerGraph) {
				powerGraph.groups.forEach(function(g) {
					g.padding = GROUP_PADDING;
				});
				powerGraph.powerEdges.forEach(function(g) {
					g.id = g.source.fullname + ":" + g.target.fullname;
				});
			}


			var gt = svg.selectAll(".colagroup")
				.data(powerGraph ? powerGraph.groups : mv.groupa, function(d) {
					return d.id;
				});

			var gtg = gt.enter().append("g");

			var gtr = gtg.append("rect")
				.attr("rx", GROUP_ROUNDY).attr("ry", GROUP_ROUNDY)
				.attr("class", "colagroup")
				.on("mouseover", groupMouseOver)
				.on("mouseout", mouseOut)
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
				.data(powerGraph ? powerGraph.powerEdges : mv.links, function(d) {
					return d.id;
				});

			lt.enter().append("path")
				.attr("class", "link")
				.attr("stroke", function(d) {
					if (powerGraph) return "green";
					return d.rel.type == "filter" ? "grey" : "blue";
				});

			lt.exit().remove();

			var nt = svg.selectAll("g.nt")
				.data(mv.nodea, function(d) {
					return d.fullname;
				});

			var nodeEnter = nt.enter()
				.append("g")
				.attr("class", "nt")
				.on("mouseover", nodeMouseOver)
				.on("mouseout", mouseOut)
				.attr("transform", function(d) {
					return "translate(400,400)";
				}); //.call(coke.drag); 

			drawNode(c, nodeEnter);

			nt.exit().remove();

			coke.on("tick", function() {

				if (optimize) {
					lt.each(function(d) {
						var srcInner = d.source.bounds.inflate(-GROUP_PADDING);
						var tgtInner = d.target.bounds.inflate(-GROUP_PADDING);
						d.route = cola.vpsc.makeEdgeBetween(srcInner, tgtInner, 0);
					});

					lt.attr("d", connector_colaroute);

				}
				else {
					lt.attr("d", connector_cubic);
				}

				gtr.attr("x", function(d) {
						return d.bounds.x + GROUP_PADDING / 2;
					})
					.attr("y", function(d) {
						return d.bounds.y + GROUP_PADDING / 2;
					})
					.attr("width", function(d) {
						return d.bounds.width() - GROUP_PADDING;
					})
					.attr("height", function(d) {
						return d.bounds.height() - GROUP_PADDING;
					});

				gtc.attr("x", function(d) {
						return d.bounds.x + d.bounds.width() / 2;
					})
					.attr("y", function(d) {
						return d.bounds.y + d.bounds.height() + NODE_R / 4;
					});

				nt.attr("transform", function(d) {
					return "translate(" + (d.x) + "," + (d.y) + ")";
				});

			});


			var dragListener = d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", dragStart)
				.on("drag", drag)
				.on("dragend", dragEnd);

			nt.call(dragListener);


		}

		function getEventPos() {
			var ev = d3.event;
			var e = typeof TouchEvent !== 'undefined' && ev.sourceEvent instanceof TouchEvent ? (ev.sourceEvent).changedTouches[0] : ev.sourceEvent;

			return {
				x: e.clientX,
				y: e.clientY
			};
		}

		function dragStart(d) {
			d.px = d.x, d.py = d.y; // set velocity to zero
			ghosts = [1, 2].map(function(i) {
				return svg.append('circle')
					.attr({
						class: 'ghost',
						cx: d.x,
						cy: d.y,
						r: d.width / 3
					});
			});
			eventStart[d.fullname] = getEventPos();
		}

		function getDragPos(d) {
			var p = getEventPos(),
				startPos = eventStart[d.fullname];
			return {
				cx: d.x + p.x - startPos.x,
				cy: d.y + p.y - startPos.y
			};
		}

		function drag(d) {
			var p = getDragPos(d);
			ghosts[1].attr(p);
		}

		function dragEnd(d) {
			ghosts.forEach(function(g) {
				return g.remove();
			});

			var dropPos = getDragPos(d);
			delete eventStart[d.fullname];

			d.x = dropPos.cx;
			d.y = dropPos.cy;

			d.fixed = true;
			coke.start(100, 20, 20);
			d.fixed = false;
		}



		function connector_cubic(d, i) {

			var offs = Math.abs(d.source.x - d.target.x) / 2;

			return "M " + (d.source.x) + " " + (d.source.y) + "C " + (d.source.x + offs) + " " + (d.source.y) + " " + (d.target.x - offs) + " " + d.target.y + " " + d.target.x + " " + d.target.y;
		}

		function connector_colaroute(d, i) {



			var x1 = d.route.sourceIntersection.x;
			var y1 = d.route.sourceIntersection.y;
			var x2 = d.route.arrowStart.x;
			var y2 = d.route.arrowStart.y;

			var offs = Math.abs(x1 - x2) / 2;

			return "M " + x1 + " " + y1 + " L " + x2 + " " + y2;

			//return "M " + (x1) + " " + (y1) + "C " + (x1 + offs) + " " + (y1) + " " + (x2 - offs) + " " + y2 + " " +x2 + " " + y2;

		}


		//expects an entry selection with a xlated g appended to it
		function drawNode(c, ne) {

			ne.append("circle")
				.attr("r", NODE_R)
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


		function groupMouseOver(d) {
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


			bjs.hover(d);
		}


		function nodeMouseOver(d) {
			svg.selectAll(".link")
				.classed("active", function(p) {
					return bjs.areNodesRelated((p.realsource || p.source), d) || bjs.areNodesRelated((p.realtarget || p.target), d);
				})
				.classed("passive", function(p) {
					return !(bjs.areNodesRelated((p.realsource || p.source), d) || bjs.areNodesRelated((p.realtarget || p.target), d));
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

		function mouseOut() {
			svg.selectAll(".passive").classed("passive", false);
			svg.selectAll(".active").classed("active", false);
			bjs.hover(null);
		}


		return bjs.cola_view;
	}


})(bjs || (bjs = {}));