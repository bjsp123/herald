"use strict";
/* global d3 */

var bjs;
(function(bjs) {

	bjs.flow_view = function() {

	var NODE_R = 8;
	var OUTPUT_GROUP_X = 850;
	var GROUP_INTERVAL_X = 400;
	var BUNDLE_OFFSET = 120;
	var AXIS_HEIGHT = 1000;
	var TOP_MARGIN = 20;
	var GROUPBAR_WIDTH = 20;
	var GROUP_PADDING = 20;
	var INVALID_DEPTH = 999; ///remember programming like this?
	var color = d3.scale.category20();


	//private state vars.  need to figure out how not to need these.
	var cached_svg = {};
	var cached_dat = {};
	var cached_conf = {};


	bjs.flow_view.render = function(svg, w, c) {
		cached_svg = svg;
		cached_conf = c;
		
		var mv = bjs.makeDirect(w);
		
		layout(mv);
		
		cached_dat = mv;

		renderGroups(svg, c, mv.groups);

		if (c["renderSummary"]) {
			renderGLinks(svg, c, mv.glinks);
			renderLinks(svg, c, []);
		}
		else {
			renderGLinks(svg, c, []);
			renderLinks(svg, c, mv.links);
		}

		renderNodes(svg, c, mv.nodea);
	}
	

	function layout(mv) {

		//arrange groups into 3 depth levels -- this simple approach isn't all that effective.
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			g.depth = 1;
			if (!g.asset.hasTargets) g.depth = 0;
			if (!g.asset.hasSources) g.depth = 2;
		}


		var stax = {};
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			g.x = OUTPUT_GROUP_X - (g.depth * GROUP_INTERVAL_X);
			g.height = g.children.length * NODE_R + GROUP_PADDING;
			g.width = GROUPBAR_WIDTH;
			if (stax[g.x] == null) {
				stax[g.x] = TOP_MARGIN + g.height + GROUP_PADDING;
				g.y = TOP_MARGIN;
			}
			else {
				g.y = stax[g.x];
				stax[g.x] += g.height + GROUP_PADDING;
			}
		}


		//now do the y locations of nodes
		//for now lets just assume they are, eh, wherever.
		//nodes are already sorted by groupname/fullname
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			for (var i = 0; i < g.children.length; ++i) {
				var node = g.children[i];
				node.y = g.y + i * NODE_R + NODE_R / 2 + GROUP_PADDING / 2;
				node.x = g.x + GROUPBAR_WIDTH / 2;
			}
		}
	}



	function renderGLinks(svg, c, glinkdata) {

		var links = svg.selectAll(".glink")
			.data(glinkdata, function(d, i) {
				return d.source.fullname + d.target.fullname;
			});


		links
			.enter()
			.append("path")
			.attr("class", "glink")
			.attr("stroke-width", function(d) {
				return d.count / 2 + 1;
			});


		links
			.attr("d", function(d) {
				return "M " + d.source.x + " " + (d.source.y + d.source.height / 2) +
					"C " + (d.source.x + BUNDLE_OFFSET) + " " + (d.source.y + d.source.height / 2) +
					" " + (d.target.x - BUNDLE_OFFSET) + " " + (d.target.y + d.target.height / 2) +
					" " + d.target.x + " " + (d.target.y + d.target.height / 2);
			});

		links
			.exit()
			.remove();

	}

	function renderLinks(svg, c, linkdata) {

		var links = svg.selectAll(".link")
			.data(linkdata, function(d, i) {
				return d.source.fullname + d.target.fullname;
			});


		links
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("stroke", function(d) {
				return d.type == "filter" ? "grey" : "blue";
			});


		links
			.attr("d", function(d) {
				return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
					"C " + (d.source.x + BUNDLE_OFFSET) + " " + (d.source.y) +
					" " + (d.target.x - BUNDLE_OFFSET) + " " + (d.target.y) +
					//"C " + (dat.groups[d.source.groupname].x+BUNDLE_OFFSET) + " " + (dat.groups[d.source.groupname].y + dat.groups[d.source.groupname].height/2) +
					//" " + (dat.groups[d.target.groupname].x-BUNDLE_OFFSET) + " " + (dat.groups[d.target.groupname].y + dat.groups[d.target.groupname].height/2) +
					" " + d.target.x + " " + (d.target.y + Math.random() * 3);
			});

		links
			.exit()
			.remove();
	}

	function renderGroups(svg, c, groups) {

		var datarray = [];

		for (var groupname in groups) {
			datarray.push(groups[groupname]);
		}

		var g = svg.selectAll(".group")
			.data(datarray, function(d, i) {
				return d.fullname;
			});

		var groupsg = g
			.enter()
			.append("g")
			.attr("class", "group")
			.on("mouseover", groupMouseOver)
			.on("mouseout", mouseOut)
			.on("click", groupClick);

		groupsg.append("rect");
		groupsg.append("text");

		g.select("rect")
			.attr("x", function(d) {
				return d.x;
			})
			.attr("width", function(d) {
				return d.width;
			})
			.style("fill", function(d) {
				return bjs.getGroupColor(color, c, d);
			})
			.attr("y", function(d) {
				return d.y;
			})
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("height", function(d) {
				return d.height;
			})
			.call(d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", function() {
					this.parentNode.appendChild(this);
				})
				.on("drag", gdragmove)
				.on("dragend", dragend));

		g.select("text")
			.attr("class", "grouplabel")
			.text(function(d) {
				return bjs.shortenString(d.fullname, 30);
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d) {
				return d.x + d.width / 2;
			})
			.attr("y", function(d, i) {
				return d.y - 4;
			});

		g.exit().remove();

	}

	function renderNodes(svg, c, ndata) {

		var nodes = svg
			.selectAll(".nodegrp")
			.data(ndata, function(d) {
				return d.fullname;
			});

		var nodesg = nodes
			.enter()
			.append("g")
			.attr("class", "nodegrp")
			.on("mouseover", nodeMouseOver)
			.on("mouseout", mouseOut);

		nodesg.append("circle");
		nodesg.append("text");

		nodes.select("circle")
			.attr("class", "node")
			.attr("r", NODE_R)
			.style("fill", function(d) {
				return bjs.getNodeColor(color, c, d);
			})
			.attr("cx", function(d, i) {
				return d.x;
			})
			.attr("cy", function(d, i) {
				return d.y;
			})
			.call(d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", function() {
					this.parentNode.appendChild(this);
				})
				.on("drag", dragmove)
				.on("dragend", dragend));

		nodes.select("text")
			.attr("class", "nodelabel")
			.text(function(d) {
				return d.name;
			})
			.attr("x", function(d, i) {
				return d.x + GROUP_PADDING / 2 + 4 + (d.x < 300 ? -30 : 0);
			})
			.attr("text-anchor", function(d) {
				return d.x < 300 ? "end" : "start";
			})
			.attr("y", function(d, i) {
				return d.y;
			});

		nodes.exit().remove();

	} 


	function fitGroupToNodes(g) {

		g.x = 100000;
		g.width = GROUPBAR_WIDTH;
		g.y = 100000;
		g.height = NODE_R * 2;

		for (var i = 0; i < g.children.length; ++i) {
			var node = g.children[i];

			if (node.x < g.x + NODE_R * 2) {
				g.x = node.x - NODE_R * 2;
			}
			
			if (node.y < g.y + NODE_R * 2) {
				g.y = node.y - NODE_R * 2;
			}
		}
		
		for (var i = 0; i < g.children.length; ++i) {
			var node = g.children[i];
		
			if (node.x > g.x + g.width - NODE_R * 2) {
				g.width = NODE_R * 2 + node.x - g.x;
			}

			if (node.y > g.y + g.height - NODE_R * 2) {
				g.height = NODE_R * 2 + node.y - g.y;
			}
		}

		g.customsize = true;
	}

	function gdragmove(d) {

		d.x += d3.event.dx;
		d.y += d3.event.dy;

		for (var i = 0; i < d.children.length; ++i) {
			var node = d.children[i];
			node.x += d3.event.dx;
			node.y += d3.event.dy;
		}
		renderGroups(cached_svg, cached_conf, cached_dat.groups);
	}

	function dragend(d) {
		if (cached_conf["renderSummary"])
			renderGLinks(cached_svg, cached_conf, cached_dat.glinka);
		else
			renderLinks(cached_svg, cached_conf, cached_dat.links);

		renderGroups(cached_svg, cached_conf, cached_dat.groups);
		renderNodes(cached_svg, cached_conf, cached_dat.nodea);
	}

	function dragmove(d) {

		d.x += d3.event.dx;
		d.y += d3.event.dy;

		fitGroupToNodes(d.group);

		renderNodes(cached_svg, cached_conf, cached_dat.nodea);
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

		svg.selectAll(".glink")
			.classed("active", function(p) {
				return p.source.fullname == d.fullname || p.target.fullname == d.fullname;
			})
			.classed("passive", function(p) {
				return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname);
			});

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

	function groupClick(d) {
		//not used
	}

	return bjs.flow_view;
}


})(bjs || (bjs = {}));
