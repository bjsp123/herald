bjscl = function() {

	var NODE_R = 8;
	var TOTAL_WIDTH = 800;
	var TOTAL_HEIGHT = 800;
	var GROUP_PADDING = 20;
	var GROUP_ROUNDY = 16;
	var NODE_W = NODE_R * 8;
	var NODE_H = NODE_R * 3.5;

	var color = d3.scale.category10();

	bjscl.mouseOverItem = function(item) {};
	bjscl.focusGroup = "";
	bjscl.colorPlan = "cat";
	bjscl.hilite = null;
	bjscl.optimize = 0;
	//private state vars

	var data = {};

	var coke = null;

	var ghosts = null;
	var eventStart = {};

	// Expects the output of resolveRelatives(process(prepare)).  This adds two arrays of ordered nodes and an array of links.
	bjscl.prepareData = function(dat) {

		//you'd think we could call createColaGraph here, but we can't as render() might get called several times in a row and obscure problems arise if it has the colagroups etc left over from before.
		data = dat;
		return dat;
	}


	bjscl.render = function(svg, info, dat) {
		createColaGraph(dat, bjscl.colorPlan);

		//have to manually remove everything or again cola gets confused.  no entry / exit animations for us!
		d3.selectAll("svg > *").remove();

		//omg omg
		coke = cola.d3adaptor()
		.linkDistance(100)
		.avoidOverlaps(true)
		.handleDisconnected(false)
		.size([TOTAL_WIDTH, TOTAL_HEIGHT]);

		coke
		.avoidOverlaps(true)
		.flowLayout('x', 300)
		.nodes(dat.nodea)
		.links(dat.colalinks)
		.groups(dat.colagroups)
		.start(50, 30, 20);

		dat.nodea.forEach(function(v) {
			v.width = NODE_W; //CART_WIDTH+NODE_R/2;
			v.height = NODE_H; //CART_HEIGHT;
		});

		dat.colagroups.forEach(function(g) {
			g.padding = GROUP_PADDING;
		});


		var gt = svg.selectAll(".colagroup")
		.data(dat.colagroups, function(d) {
			return d.id;
		});

		var gtg = gt.enter().append("g");
		
		var gtr = gtg.append("rect")
		.attr("rx", GROUP_ROUNDY).attr("ry", GROUP_ROUNDY)
		.attr("class", "colagroup")
		.on("mouseover", groupMouseOver)
		.on("mouseout", mouseOut)
		.style("stroke", function(d, i) {
			return getGroupColor(d.pkg);
		});

		var gtc = gtg.append("text")
		.text(function(d){return d.pkg.fullname;})
		.attr("text-anchor", "middle")
		.attr("class", "grouplabel")
		.style("fill", function(d) {return getGroupColor(d.pkg);});


		gt.exit().remove();


		var lt = svg.selectAll(".link")
		.data(dat.colalinks, function(d) {
			return d.id;
		});

		lt.enter().append("path")
		.attr("class", "link")
		.attr("stroke", function(d) {
			return d.link.type == "filter" ? "grey" : "blue";
		})
		.attr("d", connector_cubic);

		lt.exit().remove();

		var nt = svg.selectAll("g.nt")
		.data(dat.nodea, function(d) {
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

		drawNode(nodeEnter);

		nt.exit().remove();

		coke.on("tick", function() {

			lt.attr("d", connector_cubic);

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
			
			gtc.attr("x", function(d){
				return d.bounds.x + d.bounds.width()/2;
			})
			.attr("y", function(d){
				return d.bounds.y + d.bounds.height() + NODE_R/4;
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


	//expects an entry selection with a xlated g appended to it
	function drawNode(ne) {


		ne.append("circle")
		.attr("r", NODE_R)
		.attr("class", "node")
		.style("fill", function(d) {
			return getNodeColor(d);
		});

		ne.append("text")
		.attr("x", 0)
		.attr("y", 15)
		.attr("text-anchor", "middle")
		.attr("class", "nodelabel")
		.text(function(d) {
			return d.name;
		});

	}

	function getNodeColor(n) {
		if (n.issyntharoot) return "#fff";

		if (bjscl.hilite == "critical" && n.critical == "Critical") return "red";

		if (bjscl.hilite == "untraced" && n.ancestors.length == 0 && n.formula == '') return "red";

		return getGroupColor(n.pkg);
	}

	function getGroupColor(pkg) {
		if (bjscl.colorPlan == "cat") {
			var cat = pkg.fullname.substring(0, 7);
			return color(cat);
		}

		return color(pkg.fullname);
	}

	function groupMouseOver(d) {
		svg.selectAll(".link")
		.classed("active", function(p) {
			return p.link.source.pkgname == d.pkg.fullname || p.link.target.pkgname == d.pkg.fullname;
		})
		.classed("passive", function(p) {
			return !(p.link.source.pkgname == d.pkg.fullname || p.link.target.pkgname == d.pkg.fullname);
		});

		svg.selectAll(".node")
		.classed("active", function(p) {
			return areNodesRelatedToGroup(p, d.pkg);
		})
		.classed("passive", function(p) {
			return !areNodesRelatedToGroup(p, d.pkg);
		});

		svg.selectAll(".colagroup")
		.classed("active", function(p) {
			return p.pkg.fullname == d.pkg.fullname;
		})
		.classed("passive", function(p) {
			return p.pkg.fullname != d.pkg.fullname;
		});


		bjscl.mouseOverItem(d);
	}


	function nodeMouseOver(d) {
		svg.selectAll(".link")
		.classed("active", function(p) {
			return areNodesRelated(p.link.source, d) && areNodesRelated(p.link.target, d);
		})
		.classed("passive", function(p) {
			return !(areNodesRelated(p.link.source, d) && areNodesRelated(p.link.target, d));
		});

		svg.selectAll(".node,.nodelabel")
		.classed("active", function(p) {
			return areNodesRelated(p, d);
		})
		.classed("passive", function(p) {
			return !areNodesRelated(p, d);
		});

		bjscl.mouseOverItem(d);
	}

	function mouseOut() {
		svg.selectAll(".passive").classed("passive", false);
		svg.selectAll(".active").classed("active", false);
		bjscl.mouseOverItem(null);
	}


	function areNodesRelated(a, b) {
		if (a.fullname == b.fullname) return true;
		for (fullname in a.ancestors) {
			if (fullname == b.fullname) return true;
		}
		for (fullname in a.descendants) {
			if (fullname == b.fullname) return true;
		}
		return false;
	}

	function areNodesRelatedToGroup(n, g) {
		if (n.pkgname == g.fullname) return true;
		for (var i = 0; i < n.peers.length; ++i) {
			if (n.peers[i].pkgname == g.fullname) return true;
		}
		return false;
	}
	return bjscl;
}
