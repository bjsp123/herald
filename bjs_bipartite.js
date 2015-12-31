/* global d3 */
/* global bjs */

var bjsbp = function() {

	var NODE_R = 8;
	var LEFT_AXIS_X = 300;
	var RIGHT_AXIS_X = 700;
	var BUNDLE_OFFSET = 150;
	var GROUP_OFFSET = 150;
	var AXIS_HEIGHT = 950;
	var TOP_MARGIN = 50;
	var GROUPBAR_WIDTH = 20;
	var color = d3.scale.category10();


	bjsbp.render = function(svg, w, c) {
		
		var mv = prepareData(w, c);

		renderLinks(svg, mv);

		renderChain(svg, c, "lnodes", mv.lnodea, true, LEFT_AXIS_X);
		renderChain(svg, c, "rnodes", mv.rnodea, false, RIGHT_AXIS_X);

		if (c["optimize"] > 0) {
			renderGroups(svg, c, "lgroups", [], true, LEFT_AXIS_X - GROUP_OFFSET);
		}
		else {
			renderGroups(svg, c, "lgroups", mv.lgroups, true, LEFT_AXIS_X - GROUP_OFFSET);
		}
		renderGroups(svg, c, "rgroups", mv.rgroups, false, RIGHT_AXIS_X + GROUP_OFFSET);
	};


	function prepareData(w, c) {

		var mv = bjs.makeBipartite(w);

		if (c["optimize"] > 0) {
			unilateralBipartiteSort(mv);
		}

		for (var i = 0; i < mv.lgroupa.length; ++i) {
			mv.lgroupa[i].x = LEFT_AXIS_X - GROUP_OFFSET;
		}

		for (var i = 0; i < mv.rgroupa.length; ++i) {
			mv.rgroupa[i].x = RIGHT_AXIS_X + GROUP_OFFSET;
		}

		for (var i = 0; i < mv.lnodea.length; ++i) {
			mv.lnodea[i].x = LEFT_AXIS_X;
		}

		for (var i = 0; i < mv.rnodea.length; ++i) {
			mv.rnodea[i].x = RIGHT_AXIS_X;
		}

		updateYValues(mv);

		return mv;
	}

	function updateYValues(mv) {
		setYValues(mv.lnodea, mv.lgroupa, bjsbp.focusGroup, !bjsbp.optimize);
		setYValues(mv.rnodea, mv.rgroupa, bjsbp.focusGroup, true);
	}


	function setYValues(nodes, groups, focusGroup, bSeparateGroups) {

		if (nodes.length == 0) return;

		var numRegularNodes = 0,
			numFGNodes = 0,
			numBreaks = 0;

		var prevgroupname = nodes[0].group.fullname;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].group.fullname != prevgroupname) {
				if (bSeparateGroups) numBreaks += 1;
				prevgroupname = nodes[i].group.fullname;
			}
			if (nodes[i].group.fullname == focusGroup) {
				numFGNodes++;
			}
			else {
				numRegularNodes++;
			}
		}

		var interval = (AXIS_HEIGHT - TOP_MARGIN) / (numRegularNodes + (numBreaks) + (numFGNodes * 4));

		var y = TOP_MARGIN - interval / 2;
		var prevgroupname = nodes[0].group.fullname;
		for (var i = 0; i < nodes.length; i++) {

			y += interval;

			if (bSeparateGroups) {
				if (nodes[i].group.fullname != prevgroupname) {
					y += interval;
					prevgroupname = nodes[i].group.fullname;
				}

				if (nodes[i].group.fullname == bjsbp.focusGroup) {
					y += interval * 3;
				}
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



	//expects a mv that has lnodes and rnodes
	//uses brute force
	//leaves the rhs alone, only sorts the lhs
	function unilateralBipartiteSort(mv) {

		if (mv.lnodea.length < 2 || mv.rnodea.length < 2)
			return;

		var fr = bjs.fastrandom();

		function swappem(nodes, a, b) {
			var t = nodes[a];
			nodes[a] = nodes[b];
			nodes[b] = t;

			nodes[a].idx = a;
			nodes[b].idx = b;
		}

		function scorem(dat) {
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



	function renderLinks(svg, dat) {

		var links = svg.selectAll(".link")
			.data(dat.links, function(d, i) {
				if (d.target == null || d.source == null)
					return "";
				return d.source.fullname + d.target.fullname;

			});


		links
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("stroke", function(d) {
				return d.type == "filter" ? "grey" : "blue";
			});


		if (bjsbp.optimize) {
			links
				.transition()
				.attr("d", function(d) {
					return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
						"C " + (d.source.x + BUNDLE_OFFSET) + " " + d.source.y +
						" " + (d.target.x - BUNDLE_OFFSET) + " " + d.target.y +
						" " + d.target.x + " " + (d.target.y + Math.random() * 3);
				});
		}
		else {
			links
				.transition()
				.attr("d", function(d) {
					return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
						"C " + (d.source.x + BUNDLE_OFFSET) + " " + d.source.group.y +
						" " + (d.target.x - BUNDLE_OFFSET) + " " + d.target.group.y +
						" " + d.target.x + " " + (d.target.y + Math.random() * 3);
				});
		}

		links
			.exit()
			.transition(800).style("opacity", 0)
			.remove();
	}

	function renderGroups(svg, conf, tag, data, lefthanded, x) {

		var datarray = [];

		for (y in data) {
			datarray.push(data[y]);
		}

		var groups = svg.selectAll(".group." + tag)
			.data(datarray, function(d, i) {
				return d.fullname;
			});

		var groupsg = groups
			.enter()
			.append("g")
			.attr("class", "group " + tag)
			.on("mouseover", groupMouseOver)
			.on("mouseout", mouseOut);

		groupsg.append("rect");
		groupsg.append("line").attr("class", "grouplinetop group");
		groupsg.append("line").attr("class", "grouplinebottom group");;
		groupsg.append("text");

		groups.select("rect")
			.attr("x", x - GROUPBAR_WIDTH / 2)
			.attr("width", GROUPBAR_WIDTH)
			.style("fill", function(d) {
				return bjs.getGroupColor(color, conf, d);
			})
			.on("click", groupClick)
			.transition()
			.attr("y", function(d) {
				return d.topy;
			})
			.attr("height", function(d) {
				return d.bottomy - d.topy;
			});


		groups.select(".grouplinetop")
			.attr("x1", x)
			.attr("x2", x + (lefthanded ? GROUPBAR_WIDTH : -GROUPBAR_WIDTH))
			.transition()
			.attr("y1", function(d) {
				return d.topy;
			})
			.attr("y2", function(d) {
				return d.topy;
			});

		groups.select(".grouplinebottom")
			.attr("x1", x)
			.attr("x2", x + (lefthanded ? GROUPBAR_WIDTH : -GROUPBAR_WIDTH))
			.transition()
			.attr("y1", function(d) {
				return d.bottomy;
			})
			.attr("y2", function(d) {
				return d.bottomy;
			});

		groups.select("text")
			.attr("class", "grouplabel")
			.text(function(d) {
				return bjs.shortenString(d.fullname, 24);
			})
			.attr("x", x + (lefthanded ? -GROUPBAR_WIDTH : GROUPBAR_WIDTH))
			.attr("text-anchor", lefthanded ? "end" : "start")
			.transition()
			.attr("y", function(d, i) {
				return d.y;
			});

		groups.exit().transition(800).style("opacity", 0).remove();

	}

	function renderChain(svg, conf, tag, data, lefthanded, x) {

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
				return bjs.getNodeColor(color, conf, d);
			})
			.transition()
			.attr("cy", function(d, i) {
				return d.y;
			});

		nodes.select("text")
			.attr("class", "nodelabel")
			.text(function(d) {
				return (lefthanded & bjsbp.optimize) ? d.field.fullname : d.field.name;
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
				return p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname;
			})
			.classed("passive", function(p) {
				return !(p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname);
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
				return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
			})
			.classed("passive", function(p) {
				return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
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
		bjsbp.focusGroup = d.fullname;
		bjsbp.prepareData(data);
		bjsbp.render(svg, info, data);
	}

	return bjsbp;
}
