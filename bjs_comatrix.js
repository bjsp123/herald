/* global d3 */

var bjs;
(function(bjs) {

	bjs.cm_view = function() {

		var NODE_R = 8;
		var GROUPBAR_WIDTH = 20;
		var GROUP_OFFSET = 100;
		var MATRIX_WIDTH = 800;
		var LEFT_AXIS_X = 200;
		var TOP_AXIS_Y = 200;
		var GROUP_PADDING = 20;
		var CORNER_SPACE = 20;
		var TRANSITION_FACTOR = 1;
		var TRANSITION_DURATION = 500;
		var color = d3.scale.category20();

		//private state vars.  need to figure out how not to need these.
		var cached_svg = {};
		var cached_dat = {};


		bjs.cm_view.render = function(svg, w, c) {
			var mv = prepareData(w, c);
			cached_svg = svg;
			cached_w = w;

			renderGroups(svg, c, "lgroups", mv.lgroupa, "vertical");
			renderGroups(svg, c, "rgroups", mv.rgroupa, "horizontal");
			renderChain(svg, c, "lnodes", "Sources:", mv.lnodea, "vertical");
			renderChain(svg, c, "rnodes", "Outputs:", mv.rnodea, "horizontal");

			renderPts(svg, c, mv.pts);
		}

		function prepareData(w, c) {

			//create l and r sets -- we'll use l for the y axis.
			var mv = bjs.makeBipartite(w);

			//we want one visual element per relationship -- where a relationship may be an actual link but may be an ancestor
			//or usource or whatever.
			//each pt has a source and target taken from the l and r sets.
			var pts = [];
			for (var i = 0; i < w.fielda.length; ++i) {
				var f = w.fielda[i];

				for (ancestorfullname in f.ancestors) {
					var pt = {
						key: f.fullname + "-" + ancestorfullname,
						isFilter: f.ancestors[ancestorfullname].filter,
						isUltimate: f.ancestors[ancestorfullname].ult,
						depth: f.ancestors[ancestorfullname].depth,
						source: mv.lnodes[ancestorfullname],
						target: mv.rnodes[f.fullname],
						sourcepkg: mv.lnodes[ancestorfullname].group.fullname,
						targetpkg: mv.rnodes[f.fullname].group.fullname
					}
					pts.push(pt);
				}
			}

			mv.pts = pts;

			layout(mv);

			return mv;

		}

		function layout(mv) {
			updateOffsValues(mv.lnodea, mv.lgroupa, bjs.cm_view.focusGroup, TOP_AXIS_Y + CORNER_SPACE);
			updateOffsValues(mv.rnodea, mv.rgroupa, bjs.cm_view.focusGroup, LEFT_AXIS_X + CORNER_SPACE);
		}

		function updateOffsValues(nodes, groups, focusGroup, startOffs) {

			if (nodes.length == 0) return;

			var numRegularNodes = 0,
				numFGNodes = 0,
				numBreaks = 0;

			var prevgroup = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].group.fullname != prevgroup) {
					numBreaks += 1;
					prevgroup = nodes[i].group.fullname;
				}
				if (nodes[i].group.fullname == focusGroup) {
					numFGNodes++;
				}
				else {
					numRegularNodes++;
				}
			}

			var interval = (MATRIX_WIDTH) / (numRegularNodes + (numBreaks * 2) + (numFGNodes * 4));

			var offs = startOffs - interval / 2;
			var prevgroup = nodes[0].group.fullname;
			for (var i = 0; i < nodes.length; i++) {

				offs += interval;

				if (nodes[i].group.fullname != prevgroup) {
					offs += interval;
					prevgroup = nodes[i].group.fullname;
				}

				if (nodes[i].group.fullname == focusGroup) {
					offs += interval * 3;
				}

				nodes[i].offs = offs;
				nodes[i].thickness = interval;

			}

			for (var j = 0; j < groups.length; ++j) {
				var p = groups[j];
				p.topoffs = 10000000;
				p.bottomoffs = 0;
				for (var i = 0; i < p.children.length; ++i) {
					if (p.children[i].offs < p.topoffs) {
						p.topoffs = p.children[i].offs;
					}
					if (p.children[i].offs > p.bottomoffs) {
						p.bottomoffs = p.children[i].offs;
					}
				}
				p.offs = (p.topoffs + p.bottomoffs) / 2;
				p.topoffs -= interval - 2;
				p.bottomoffs += interval - 2;
			}


		}

		function renderGroups(svg, c, tag, data, orientation) {

			var vert = (orientation == "vertical");
			var fixedPos = (vert ? LEFT_AXIS_X : TOP_AXIS_Y) - GROUP_OFFSET;

			var groups = svg.selectAll(".group." + tag)
				.data(data, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.on("mouseover", groupMouseOver)
				.on("mouseout", mouseOut);

			groupsg.append("rect").on("click", groupClick);
			groupsg.append("line").attr("class", "grouplinetop group");
			groupsg.append("line").attr("class", "grouplinebottom group");;
			groupsg.append("text");

			groups.select("rect")
				.style("fill", function(d) {
					return bjs.getGroupColor(color, c, d);
				})

			.transition().delay(function(d, i) {
					return d.topoffs / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("x", vert ? (fixedPos - GROUPBAR_WIDTH / 2) : function(d) {
					return d.topoffs;
				})
				.attr("width", vert ? (GROUPBAR_WIDTH) : function(d) {
					return d.bottomoffs - d.topoffs;
				})
				.attr("y", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos - GROUPBAR_WIDTH / 2))
				.attr("height", vert ? function(d) {
					return d.bottomoffs - d.topoffs;
				} : (GROUPBAR_WIDTH));


			groups.select(".grouplinetop")
				.transition().delay(function(d, i) {
					return d.topoffs / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("x1", vert ? (fixedPos) : function(d) {
					return d.topoffs;
				})
				.attr("x2", vert ? (fixedPos + GROUPBAR_WIDTH) : function(d) {
					return d.topoffs;
				})
				.attr("y1", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos + GROUPBAR_WIDTH))
				.attr("y2", vert ? function(d) {
					return d.topoffs;
				} : (fixedPos));

			groups.select(".grouplinebottom")
				.transition().delay(function(d, i) {
					return d.topoffs / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("x1", vert ? (fixedPos) : function(d) {
					return d.bottomoffs;
				})
				.attr("x2", vert ? (fixedPos + GROUPBAR_WIDTH) : function(d) {
					return d.bottomoffs;
				})
				.attr("y1", vert ? function(d) {
					return d.bottomoffs;
				} : (fixedPos + GROUPBAR_WIDTH))
				.attr("y2", vert ? function(d) {
					return d.bottomoffs;
				} : (fixedPos));

			groups.select("text")
				.attr("class", "grouplabel")
				.text(function(d) {
					return bjs.shortenString(d.fullname, 24);
				})
				.attr("text-anchor", vert ? "end" : "start")
				.attr("transform", vert ? function(d) {
					return "rotate(-45 " + (fixedPos - GROUPBAR_WIDTH) + " " + d.offs + ")";
				} : function(d) {
					return "rotate(-45 " + d.offs + " " + (fixedPos - GROUPBAR_WIDTH) + ")";
				})
				//.transition().delay(function(d,i){return i*100;}).duration(TRANSITION_DURATION)
				.attr("x", vert ? (fixedPos - GROUPBAR_WIDTH) : function(d) {
					return d.offs;
				})
				.attr("y", vert ? function(d, i) {
					return d.offs;
				} : (fixedPos - GROUPBAR_WIDTH));

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		function renderChain(svg, c, tag, label, data, orientation) {

			var vert = (orientation == "vertical");
			var fixedPos = (vert ? LEFT_AXIS_X : TOP_AXIS_Y);

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter().append("g");

			axis.append("text");
			axis.append("line");

			axis.select("text")
				.text(label)
				.attr("class", "biglabel")
				.attr("text-anchor", vert ? "end" : "start")
				.attr("x", vert ? LEFT_AXIS_X - GROUP_OFFSET : LEFT_AXIS_X - GROUP_OFFSET)
				.attr("y", vert ? TOP_AXIS_Y : (TOP_AXIS_Y - GROUP_OFFSET));

			axis.select("line")
				.attr("class", "axis " + tag)
				.attr("x1", vert ? LEFT_AXIS_X : LEFT_AXIS_X)
				.attr("y1", vert ? TOP_AXIS_Y : TOP_AXIS_Y)
				.attr("x2", vert ? LEFT_AXIS_X : MATRIX_WIDTH + LEFT_AXIS_X)
				.attr("y2", vert ? MATRIX_WIDTH + TOP_AXIS_Y : TOP_AXIS_Y);

			var nodes = svg
				.selectAll(".node." + tag)
				.data(data, function(d) {
					return d.fullname;
				});

			var nodesg = nodes
				.enter()
				.append("g")
				.attr("class", "node " + tag)
				.on("mouseover", nodeMouseOver)
				.on("mouseout", mouseOut);

			nodesg.append("line");
			nodesg.append("circle");
			nodesg.append("text");


			nodes.select("line")
				.attr("style", function(d, i) {
					return "stroke-width:0.5;stroke:" + bjs.getNodeColor(color, c, d);
				}) // attr rather than style because it needs to override the css style
				.on("mouseover", null)
				.on("mouseout", null)
				.transition().delay(function(d, i) {
					return d.offs / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("x1", vert ? fixedPos : function(d, i) {
					return d.offs;
				})
				.attr("y1", vert ? function(d, i) {
					return d.offs;
				} : fixedPos)
				.attr("x2", vert ? (MATRIX_WIDTH + LEFT_AXIS_X) : function(d, i) {
					return d.offs;
				})
				.attr("y2", vert ? function(d) {
					return d.offs;
				} : (MATRIX_WIDTH + TOP_AXIS_Y));

			nodes.select("circle")
				.attr("class", "node")
				.attr("r", NODE_R)
				.style("fill", function(d) {
					return bjs.getNodeColor(color, c, d);
				})
				.transition().delay(function(d, i) {
					return d.offs / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("cx", vert ? fixedPos : function(d, i) {
					return d.offs;
				})
				.attr("cy", vert ? function(d, i) {
					return d.offs;
				} : fixedPos);

			nodes.select("text")
				.attr("class", "nodelabel")
				.text(function(d) {
					return d.field.name;
				})
				.attr("text-anchor", vert ? "end" : "start")
				//.transition().delay(function(d,i){return d.offs/1000;}).duration(2000)
				.attr("transform", vert ? function(d) {
					return "rotate(-45 " + (fixedPos - GROUPBAR_WIDTH) + " " + d.offs + ")";
				} : function(d) {
					return "rotate(-45 " + d.offs + " " + (fixedPos - GROUPBAR_WIDTH) + ")";
				})

			.attr("x", vert ? (fixedPos - NODE_R * 2) : function(d, i) {
					return d.offs - NODE_R / 2;
				})
				.attr("y", vert ? function(d, i) {
					return d.offs + NODE_R;
				} : (fixedPos - NODE_R * 1.5)); //there is some subjective tuning in text position.

			nodes.exit().transition(800).style("opacity", 0).remove();

		}

		function renderPts(svg, c, data) {

			var pts = svg.selectAll(".pt")
				.data(data, function(d, i) {
					return d.key;
				});

			var ptsg = pts
				.enter()
				.append("g")
				.attr("class", "pt");

			ptsg.append("circle");

			pts.select("circle")
				.style("fill", function(d) {
					return getPtColor(d);
				})
				.transition().delay(function(d, i) {
					return (d.target.offs) / TRANSITION_FACTOR;
				}).duration(TRANSITION_DURATION)
				.attr("cx", function(d) {
					return d.target.offs;
				})
				.attr("r", function(d) {
					return getPtRadius(d);
				})
				.attr("cy", function(d) {
					return d.source.offs;
				});


			pts.exit().transition(800).style("opacity", 0).remove();
		}

		function getPtRadius(pt) {
			if (pt.depth == 0) {
				return NODE_R * 0.8;
			}

			if (pt.depth == 1) {
				return NODE_R * 0.66;
			}
			return NODE_R * 0.45;
		}

		function getPtColor(pt) {
			if (pt.depth == 0) {
				return "#31a354";
			}

			if (pt.depth == 1) {
				return "#78c679";
			}
			return "#addd8e";
		}

		function groupClick(d) {
			bjs.cm_view.focusGroup = d.fullname;
			bjs.cm_view.prepareData(cached_dat);
			bjs.cm_view.render(cached_svg, info, cached_dat);
		}


		// not currently used -- not sure what there is to do that's useful when user hovers over a point
		function ptMouseOver(d) {
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
		}

		function groupMouseOver(d) {

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


		function nodeMouseOver(d) {

			svg.selectAll(".node,.nodelabel")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p, d);
				})
				.classed("passive", function(p) {
					return !bjs.areNodesRelated(p, d);
				});

			svg.selectAll(".pt")
				.classed("active", function(p) {
					return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
				});

			bjs.hover(d);
		}

		function mouseOut() {
			svg.selectAll(".passive").classed("passive", false);
			svg.selectAll(".active").classed("active", false);
			bjs.hover(null);
		}

		return bjs.cm_view;
	}


})(bjs || (bjs = {}));
