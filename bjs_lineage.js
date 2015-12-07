bjsln = function(){

	var NODE_R = 8;
	var OUTPUT_GROUP_X = 850;
	var GROUP_INTERVAL_X = 400;
	var BUNDLE_OFFSET = 120;
	var AXIS_HEIGHT = 1000;
	var TOP_MARGIN = 20;
	var GROUPBAR_WIDTH = 20;
	var GROUP_PADDING = 20;
	var INVALID_DEPTH = 999;///remember programming like this?
	var color = d3.scale.category20();

	//calling page can set these based on config.
	//bjsln.groupFunc = function(field){return field.pkgname;};
	//bjsln.fieldFilterFunc = function(field){return true;};
	bjsln.mouseOverItem = function(item){};
	bjsln.renderSummary = false;
	bjsln.colorPlan = "cat";
	bjsln.hilite = null;

	//private state vars.  need to figure out how not to need these.
	var cached_svg={};
	var cached_dat={};


// preparedata expects the output of resolveRelatives(process(prepare()))

	bjsln.prepareData = function(dat){

		layout(dat.nodes, dat.pkgs);
	}

	function layout(nodes, pkgs) {

		//now, for each group, set its depth -- the number of steps from it to an output node
		//now I think of it, it may not be connectd to an output node... hm.


		for(pkgname in dat.pkgs) {
			var pkg = dat.pkgs[pkgname];
			pkg.depth = 1;
			if(!pkg.hasTargets) pkg.depth = 0;
			if(!pkg.hasSources) pkg.depth = 2;
		}
		

		var stax = {};
		for (pkgname in dat.pkgs) {
			var pkg = dat.pkgs[pkgname];
			pkg.x = OUTPUT_GROUP_X - (pkg.depth * GROUP_INTERVAL_X);
			pkg.height = pkg.children.length * NODE_R + GROUP_PADDING;
			pkg.width = GROUPBAR_WIDTH;
			if(stax[pkg.x] == null) {
				stax[pkg.x] = TOP_MARGIN + pkg.height + GROUP_PADDING;
				pkg.y = TOP_MARGIN;
			} else {
				pkg.y = stax[pkg.x];
				stax[pkg.x] += pkg.height + GROUP_PADDING;
			}
		}


		//now do the y locations of nodes
		//for now lets just assume they are, eh, wherever.
		//nodes are already sorted by groupname/fullname
		for(pkgname in dat.pkgs) {
			var pkg = dat.pkgs[pkgname];
			for(var i=0; i <pkg.children.length;++i){
				var node = pkg.children[i];
				node.y = pkg.y + i * NODE_R + NODE_R/2 + GROUP_PADDING/2;
				node.x = pkg.x + GROUPBAR_WIDTH/2;
			}
		}

		return dat;
	}

	bjsln.render = function(svg, info, dat)
	{
		cached_svg = svg;
		cached_dat = dat;

		renderGroups(svg, dat.pkgs);

		if(bjsln.renderSummary){
			renderGLinks(svg, dat.glinka);
			renderLinks(svg, []);
		}else{
			renderGLinks(svg, []);
			renderLinks(svg, dat.links);
		}

		

		renderNodes(svg, dat.nodea);
	}

	function renderGLinks(svg, glinkdata) {

		var links = svg.selectAll(".glink")
				.data(glinkdata, function(d,i){return d.source.fullname + d.target.fullname;});


		links
			.enter()
			.append("path")
			.attr("class", "glink")
			.attr("stroke-width", function(d){return d.count/2 + 1;});


		links
			.attr("d", function(d){
				return "M " + d.source.x + " " + (d.source.y + d.source.height/2) +
						"C " + (d.source.x+BUNDLE_OFFSET) + " " + (d.source.y+d.source.height/2) +
						" " + (d.target.x-BUNDLE_OFFSET) + " " + (d.target.y+d.target.height/2) +
						" " + d.target.x + " " + (d.target.y+d.target.height/2);
			});

		links
			.exit()
			.remove();

	}

	function renderLinks(svg, linkdata){

		var links = svg.selectAll(".link")
				.data(linkdata, function(d,i){return d.source.fullname + d.target.fullname;});


		links
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("stroke", function(d){return d.type=="filter"?"grey":"blue";});


		links
			.attr("d", function(d){
				return "M " + d.source.x + " " + (d.source.y+Math.random()*3) +
						"C " + (d.source.x+BUNDLE_OFFSET) + " " + (d.source.y) +
						" " + (d.target.x-BUNDLE_OFFSET) + " " + (d.target.y) +
						//"C " + (dat.groups[d.source.groupname].x+BUNDLE_OFFSET) + " " + (dat.groups[d.source.groupname].y + dat.groups[d.source.groupname].height/2) +
						//" " + (dat.groups[d.target.groupname].x-BUNDLE_OFFSET) + " " + (dat.groups[d.target.groupname].y + dat.groups[d.target.groupname].height/2) +
						" " + d.target.x + " " + (d.target.y+Math.random()*3);
			});

		links
			.exit()
			.remove();
	}

	function renderGroups(svg, groups){

		var datarray = [];

		for(groupname in groups){
			datarray.push(groups[groupname]);
		}

		var g = svg.selectAll(".group")
			.data(datarray, function(d,i){return d.fullname;});

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
			.attr("x", function(d){return d.x;})
			.attr("width", function(d){return d.width; })
			.style("fill",function(d){return getGroupColor(d);})
			.attr("y", function(d){return d.y;})
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("height", function(d){return d.height; })
			.call(d3.behavior.drag()
		      .origin(function(d) { return d; })
		      .on("dragstart", function() { this.parentNode.appendChild(this); })
		      .on("drag", gdragmove)
		      .on("dragend", dragend));
			
		g.select("text")
			.attr("class","grouplabel")
			.text(function(d){return shortenString(d.fullname, 30);})
			.attr("text-anchor", "middle")
			.attr("x", function(d){return d.x + d.width/2;})
			.attr("y",function(d,i){return d.y-4;});

		g.exit().remove();

	}

	function renderNodes(svg, ndata){

		var nodes = svg
			.selectAll(".nodegrp")
			.data(ndata, function(d){return d.fullname;});

		var nodesg = nodes
			.enter()
			.append("g")
			.attr("class", "nodegrp")
			.on("mouseover", nodeMouseOver)
			.on("mouseout", mouseOut);

		nodesg.append("circle");
		nodesg.append("text");

		nodes.select("circle")
			.attr("class","node")
			.attr("r", NODE_R)
			.style("fill",function(d){return getNodeColor(d);})
			.attr("cx", function(d,i){return d.x;})
			.attr("cy", function(d,i){return d.y;})
			.call(d3.behavior.drag()
		      .origin(function(d) { return d; })
		      .on("dragstart", function() { this.parentNode.appendChild(this); })
		      .on("drag", dragmove)
		      .on("dragend", dragend));

		nodes.select("text")
			.attr("class","nodelabel")
			.text(function(d){return d.name;})
			.attr("x",function(d,i){return d.x + GROUP_PADDING/2 + 4 + (d.x < 300?-30:0);})
			.attr("text-anchor", function(d){return d.x < 300?"end":"start";})
			.attr("y",function(d,i){return d.y;});

		nodes.exit().remove();

	}//

	function getNodeColor(n){
		if(bjsln.hilite == "critical" && n.critical == "Critical") return "red";

		if(bjsln.hilite == "untraced" && n.ancestors.length == 0 && n.formula == '') return "red";

		if(bjsln.colorPlan=="cat") {
			var cat = n.pkg.fullname.substring(0,7);
			return color(cat);
		}

		return color(n.pkg.fullname);
	}

	function getGroupColor(g){

		if(g.customsize == true){
			return "0xdddddd";
		}

		if(bjsln.colorPlan=="cat") {
			var cat = g.fullname.substring(0,7);
			return color(cat);
		}

		return color(g.fullname);
	}

	function fitGroupToNodes(g){

		g.x=100000;
		g.width = GROUPBAR_WIDTH;
		g.y = 100000;
		g.height = NODE_R*2;

		for(var i=0; i < g.children.length; ++i) {
	    	var node = g.children[i];

	    	if(node.x < g.x+NODE_R*2){
	    		g.x = node.x-NODE_R*2;
	    	}
	    	if(node.x > g.x+g.width-NODE_R*2){
	    		g.width = NODE_R*2+node.x-g.x;
	    	}

	    	if(node.y < g.y+NODE_R*2){
	    		g.y = node.y-NODE_R*2;
	    	}

	    	if(node.y > g.y+g.height-NODE_R*2){
	    		g.height = NODE_R*2+node.y-g.y;
	    	}
	    }

	    g.customsize = true;
	}

	function gdragmove(d) {

	    d.x += d3.event.dx;
	    d.y += d3.event.dy;

	    for (var i=0; i < d.children.length; ++i){
	    	var node = d.children[i];
	    	node.x += d3.event.dx;
	    	node.y += d3.event.dy;
	    }
	    renderGroups(cached_svg, cached_dat.pkgs);
	  }

	  function dragend(d) {
	  	if(bjsln.renderSummary)
	    	renderGLinks(cached_svg, cached_dat.glinka);
	    else
	    	renderLinks(cached_svg, cached_dat.links);

	    renderGroups(cached_svg, cached_dat.pkgs);
	    renderNodes(cached_svg, cached_dat.nodea);
	  }

	  function dragmove(d) {

	    d.x += d3.event.dx;
	    d.y += d3.event.dy;

	    fitGroupToNodes(d.pkg);

	    renderNodes(cached_svg, cached_dat.nodea);
	  }

	  function linkMouseOver(d) {
	  }

	function groupMouseOver(d) {
		svg.selectAll(".link")
	    	.classed("active", function(p) {return p.source.pkgname == d.fullname || p.target.pkgname == d.fullname; }) 
	    	.classed("passive", function(p){return !(p.source.pkgname == d.fullname || p.target.pkgname == d.fullname); });

	    svg.selectAll(".glink")
	    	.classed("active", function(p) {return p.source.fullname == d.fullname || p.target.fullname == d.fullname; }) 
	    	.classed("passive", function(p){return !(p.source.fullname == d.fullname || p.target.fullname == d.fullname); });

	    svg.selectAll(".node,.nodelabel")
	    	.classed("active", function(p) {return areNodesRelatedToGroup(p, d); }) 
	    	.classed("passive", function(p){return !areNodesRelatedToGroup(p, d); });

	    svg.selectAll(".group")
	    	.classed("active", function(p) {return p.fullname == d.fullname;})
	    	.classed("passive", function(p) {return p.fullname != d.fullname;});


	    bjsln.mouseOverItem(d);
	}


  function nodeMouseOver(d) {
    svg.selectAll(".link")
    	.classed("active", function(p) { return areNodesRelated(p.source, d) && areNodesRelated(p.target, d); })
    	.classed("passive",function(p) { return !(areNodesRelated(p.source, d) && areNodesRelated(p.target, d)); });

    svg.selectAll(".node,.nodelabel")
    	.classed("active", function(p) {return areNodesRelated(p, d); }) 
    	.classed("passive", function(p){return !areNodesRelated(p, d); });

    bjsln.mouseOverItem(d);
  }

  function mouseOut() {
  	svg.selectAll(".passive").classed("passive", false);
    svg.selectAll(".active").classed("active", false);
    bjsln.mouseOverItem(null);
  }

  function groupClick(d) {
	    bjsln.focusGroup = d.name;
	    //not used
  	}

  function areNodesRelated(a, b){
	if(a.fullname == b.fullname) return true;
	for(fullname in a.ancestors){
		if(fullname == b.fullname) return true;
  	}
  	for(fullname in a.descendants){
		if(fullname == b.fullname) return true;
  	}
  	return false;
  }

  function areNodesRelatedToGroup(n, g){
	if(n.pkgname == g.fullname) return true;
	for(var i=0;i<n.peers.length;++i){
		if(n.peers[i].pkgname == g.fullname) return true;
  	}
  	return false;
  }

  return bjsln;
}
	
