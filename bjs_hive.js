/* global d3 */

var bjs;
(function(bjs) {

	bjs.hive_view = function() {

		var NODE_R = 8;
		var LEFT_AXIS_X = 200;
		var MIDDLE_AXIS_X = 500;
		var RIGHT_AXIS_X = 800;
		var BUNDLE_OFFSET = 100;
		var GROUP_OFFSET = 140;
		var AXIS_HEIGHT = 950;
		var TOP_MARGIN = 50;
		var GROUPBAR_WIDTH = 20;
		var color = d3.scale.category10();


		bjs.hive_view.render = function(svg, w, c) {
			var mv = prepareData(w, c);

			renderLinks(svg, mv);

			renderChain(svg, c, "lnodes", mv.lnodea, true, LEFT_AXIS_X);
			renderChain(svg, c, "rnodes", mv.rnodea, false, RIGHT_AXIS_X);
			renderChain(svg, c, "m1nodes", mv.m1nodea, true, MIDDLE_AXIS_X - GROUP_OFFSET / 2);
			renderChain(svg, c, "m2nodes", mv.m2nodea, false, MIDDLE_AXIS_X + GROUP_OFFSET / 2);

			renderGroups(svg, c, "lgroups", mv.lgroupa, "left", LEFT_AXIS_X - GROUP_OFFSET);
			renderGroups(svg, c, "rgroups", mv.rgroupa, "right", RIGHT_AXIS_X + GROUP_OFFSET);
			renderGroups(svg, c, "mgroups", mv.mgroupa, "middle", MIDDLE_AXIS_X);
		}


		function prepareData(w) {


			var mv = bjs.makeTripartite(w);

			for (var i = 0; i < mv.lgroupa.length; ++i) {
				mv.lgroupa[i].x = LEFT_AXIS_X - GROUP_OFFSET;
			}

			for (var i = 0; i < mv.rgroupa.length; ++i) {
				mv.rgroupa[i].x = RIGHT_AXIS_X + GROUP_OFFSET;
			}

			for (var i = 0; i < mv.mgroupa.length; ++i) {
				mv.mgroupa[i].x = MIDDLE_AXIS_X;
			}

			for (var i = 0; i < mv.lnodea.length; ++i) {
				mv.lnodea[i].x = LEFT_AXIS_X;
			}

			for (var i = 0; i < mv.rnodea.length; ++i) {
				mv.rnodea[i].x = RIGHT_AXIS_X;
			}

			for (var i = 0; i < mv.m1nodea.length; ++i) {
				mv.m1nodea[i].x = MIDDLE_AXIS_X - GROUP_OFFSET / 2;
			}

			for (var i = 0; i < mv.m2nodea.length; ++i) {
				mv.m2nodea[i].x = MIDDLE_AXIS_X + GROUP_OFFSET / 2;
			}

			updateYValues(mv);

			return mv;
		}

		function updateYValues(mv) {
			setYValues(mv.rnodea, mv.rgroupa, bjs.hive_view.focusGroup);
			setYValues(mv.lnodea, mv.lgroupa, bjs.hive_view.focusGroup);
			setYValues(mv.m1nodea, mv.mgroupa, bjs.hive_view.focusGroup);
			setYValues(mv.m2nodea, mv.mgroupa, bjs.hive_view.focusGroup);
		}


		function setYValues(nodes, groups, focusGroup) {

			if (nodes.length == 0) return;

			var numRegularNodes = 0,
				numFGNodes = 0,
				numBreaks = 0;

			var prevgroup = nodes[0].pkgname;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].pkgname != prevgroup) {
					numBreaks += 1;
					prevgroup = nodes[i].pkgname;
				}
				if (nodes[i].pkgname == focusGroup) {
					numFGNodes++;
				}
				else {
					numRegularNodes++;
				}
			}

			var interval = (AXIS_HEIGHT - TOP_MARGIN) / (numRegularNodes + (numBreaks * 2) + (numFGNodes * 4));

			var y = TOP_MARGIN - interval / 2;
			var prevgroup = nodes[0].pkgname;
			for (var i = 0; i < nodes.length; i++) {

				y += interval;

				if (nodes[i].pkgname != prevgroup) {
					y += interval;
					prevgroup = nodes[i].pkgname;
				}

				if (nodes[i].pkgname == focusGroup) {
					y += interval * 3;
				}

				nodes[i].y = y;
			}

			for (var j = 0; j < groups.length; ++j) {
				var p = groups[j];
				p.topy = 10000000;
				p.bottomy = 0;
				for (var i = 0; i < p.children.length; ++i) {
					if (p.children[i].y < p.topy) {
						p.topy = p.children[i].y;
					}
					if (p.children[i].y > p.bottomy) {
						p.bottomy = p.children[i].y;
					}
				}
				p.y = (p.topy + p.bottomy) / 2;
				p.topy -= interval - 2;
				p.bottomy += interval - 2;
				if (p.topy < TOP_MARGIN) p.topy = TOP_MARGIN;
				if (p.bottomy > AXIS_HEIGHT) p.bottomy = AXIS_HEIGHT;
			}
		}


		function renderLinks(svg, dat) {

			var links = svg.selectAll(".link")
				.data(dat.links, function(d, i) {
					return d.source.fullname + d.target.fullname;
				});


			links
				.enter()
				.append("path")
				.attr("class", "link")
				.attr("stroke", bjs.getLinkColor);


			links
				.transition()
				.attr("d", function(d) {
					return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
						"C " + (d.source.x + BUNDLE_OFFSET) + " " + d.source.y +
						" " + (d.target.x - BUNDLE_OFFSET) + " " + d.target.y +
						" " + d.target.x + " " + (d.target.y + Math.random() * 3);
				});

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		function renderGroups(svg, c, tag, data, orientation, x) {

			var datarray = [];

			for (y in data) {
				datarray.push(data[y]);
			}

			var xoffset = 0;
			if (orientation == "left") xoffset = -GROUPBAR_WIDTH;
			if (orientation == "right") xoffset = GROUPBAR_WIDTH;
			var textanchor = "center";
			if (orientation == "left") textanchor = "end";
			if (orientation == "right") textanchor = -"start";


			var groups = svg.selectAll(".group." + tag)
				.data(datarray, function(d, i) {
					return d.fullname;
				});

			var groupsg = groups
				.enter()
				.append("g")
				.attr("class", "group " + tag)
				.on("mouseover", groupMouseOver)
				.on("mouseout", mouseOut)
				.on("click", groupClick);

			groupsg.append("rect");
			groupsg.append("line").attr("class", "grouplinetop group");
			groupsg.append("line").attr("class", "grouplinebottom group");;
			groupsg.append("text");

			groups.select("rect")
				.attr("x", x - GROUPBAR_WIDTH / 2)
				.attr("width", GROUPBAR_WIDTH)
				.style("fill", function(d) {
					return bjs.getGroupColor(color, c, d);
				})
				.transition()
				.attr("y", function(d) {
					return d.topy;
				})
				.attr("height", function(d) {
					return d.bottomy - d.topy;
				});


			groups.select(".grouplinetop")
				.attr("x1", x)
				.attr("x2", x + xoffset)
				.transition()
				.attr("y1", function(d) {
					return d.topy;
				})
				.attr("y2", function(d) {
					return d.topy;
				});

			groups.select(".grouplinebottom")
				.attr("x1", x)
				.attr("x2", x + xoffset)
				.transition()
				.attr("y1", function(d) {
					return d.bottomy;
				})
				.attr("y2", function(d) {
					return d.bottomy;
				});

			if (orientation != "middle") {
				groups.select("text")
					.attr("class", "grouplabel")
					.text(function(d) {
						return bjs.shortenString(d.fullname, 24);
					})
					.attr("x", x + xoffset)
					.attr("text-anchor", textanchor)
					.transition()
					.attr("y", function(d, i) {
						return d.y;
					});
			}

			groups.exit().transition(800).style("opacity", 0).remove();

		}

		function renderChain(svg, c, tag, data, lefthanded, x) {

			var axis = svg.selectAll(".axis." + tag)
				.data([1]).enter()
				.append("line")
				.attr("class", "axis " + tag)
				.attr("x1", x)
				.attr("y1", 0)
				.attr("x2", x)
				.attr("y2", AXIS_HEIGHT);

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

			nodesg.append("rect");
			nodesg.append("circle");
			nodesg.append("text");

			nodes.select("rect")
				.attr("class", "nodeinvis")
				.attr("x", function(d, i) {
					return d.x + (lefthanded ? -GROUP_OFFSET : 0);
				})
				.attr("width", function(d, i) {
					return GROUP_OFFSET;
				})
				.attr("height", function(d, i) {
					return 18;
				})
				.transition()
				.attr("y", function(d, i) {
					return d.y;
				});

			nodes.select("circle")
				.attr("class", "node")
				.attr("r", NODE_R)
				.attr("cx", function(d, i) {
					return d.x;
				})
				.style("fill", function(d) {
					return bjs.getNodeColor(color, c, d);
				})
				.transition()
				.attr("cy", function(d, i) {
					return d.y;
				});

			nodes.select("text")
				.attr("class", "nodelabel")
				.text(function(d) {
					return d.field.name;
				})
				.attr("x", function(d, i) {
					return d.x + (lefthanded ? -20 : 20);
				})
				.attr("text-anchor", lefthanded ? "end" : "start")
				.transition()
				.attr("y", function(d, i) {
					return d.y;
				});

			nodes.exit().transition(800).style("opacity", 0).remove();

		}

		function linkMouseOver(d) {}

		function groupMouseOver(d) {
			svg.selectAll(".link")
				.classed("active", function(p) {
					return p.source.pkgname == d.fullname || p.target.pkgname == d.fullname;
				})
				.classed("passive", function(p) {
					return !(p.source.pkgname == d.fullname || p.target.pkgname == d.fullname);
				});

			svg.selectAll(".node")
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


			bjs.hover(d);
		}


		function nodeMouseOver(d) {
			svg.selectAll(".link")
				.classed("active", function(p) {
					return bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d);
				})
				.classed("passive", function(p) {
					return !(bjs.areNodesRelated(p.source, d) && bjs.areNodesRelated(p.target, d));
				});

			svg.selectAll(".node")
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

		function groupClick(d) {
			bjs.hive_view.focusGroup = d.fullname;
			bjs.hive_view.prepareData(data);
			bjs.hive_view.render(svg, info, data);
		}


		return bjs.hive_view;
	}



})(bjs || (bjs = {}));