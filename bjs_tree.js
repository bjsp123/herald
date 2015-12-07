bjstr = function(){

	var NODE_R = 8;
	var TOTAL_HEIGHT = 1000;//x and y are flipped for trees.
	var X_OFFSET = 400;//to account for hidden leftmost node
	var TOTAL_WIDTH=1000 + X_OFFSET;
	var TOP_MARGIN = 20;
	var CART_WIDTH = 160;
	var CART_HEIGHT = 34;
	var CART_FLAT_HEIGHT = CART_HEIGHT-10;
	var color = d3.scale.category20();

	//calling page can set these based on config.
	//bjstr.groupFunc = function(field){return field.pkgname;};
	//bjstr.fieldFilterFunc = function(field){return true;};
	bjstr.mouseOverItem = function(item){};
	bjstr.renderSummary = false;
	bjstr.colorPlan = "cat";
	bjstr.hilite = null;

	//private state vars.  need to figure out how not to need these.
	var cached_svg={};
	var cached_dat={};
	var cached_info ={};


// preparedata expects the output of resolveRelatives(process(prepare()))

	bjstr.prepareData = function(dat){

		cached_dat = dat;

		extractTree(dat);

		//add a synthetic root and gather all the treeroots in the dataset under it
		var syntharoot = {};
		syntharoot.children = dat.treeroot;
		syntharoot.fullname = "";
		syntharoot.issyntharoot = true;

		syntharoot.x0 = 0;//these values only exist to give a point from which new nodes will appear / old nodes will disappear
		syntharoot.y0 = TOTAL_HEIGHT/2;

		syntharoot.children.forEach(collapse);
		dat.syntharoot = syntharoot;
	}

	bjstr.render = function(svg, info, dat)
	{
		cached_svg = svg;
		cached_info = info;
		cached_dat = dat;

		var tree = d3.layout.tree().size([TOTAL_HEIGHT,TOTAL_WIDTH]);

		var nodes = tree.nodes(dat.syntharoot);
		var links = tree.links(nodes);

		var duration = 500;

		nodes = nodes.filter(function(d){return !d.issyntharoot;});
		links = links.filter(function(d){return !d.source.issyntharoot;});

		//shift everything left to account for hidden root node
  		nodes.forEach(function(d) { d.y -= X_OFFSET; });


		var nt = svg.selectAll("g.nt")
			.data(nodes, function(d) { return d.nameintree;});

		var nodeEnter = nt.enter()
			.append("g")
			//.filter(function(d) { return !d.issyntharoot;})
			.attr("class", "nt")
			.attr("transform", function(d){return "translate(" + d.parent.y0 + "," + d.parent.x0 + ")"; })
			.style("fill-opacity", 1e-6)
		    .style("stroke-opacity", 1e-6)
		    .on("click", onNodeClick)
			.on("mouseover", nodeMouseOver)
			.on("mouseout", mouseOut);
			;

		drawNode(nodeEnter);

		 var nodeUpdate = nt.transition()
			.duration(duration)
			.style("fill-opacity", 1)
			.style("stroke-opacity", 1)
			.attr("transform", function(d) { return "translate(" + (d.y) + "," + (d.x) + ")"; });


		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = nt.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.parent.y+ "," + d.parent.x + ")"; })
		      .style("fill-opacity", 1e-6)
		      .style("stroke-opacity", 1e-6)
		      .remove();


		  // Update the links…
		  var tl = svg.selectAll("path.link")
		      .data(links, function(d) { return d.target.nameintree; });

		  // Enter any new links at the parent's previous position.
		  tl.enter().insert("path","g")
		  	  //.filter(function(d) { return !d.source.issyntharoot && !d.target.issyntharoot;})
		      .attr("class", "link")
		      .attr("stroke", "grey")
		      .style("stroke-opacity", 1e-6)
		      .attr("d", function(d) {
		        var o = {x: d.source.x0, y: d.source.y0};
		        return connector_cubic({source: o, target: o});
		      });

		  // Transition links to their new position.
		  tl.transition()
		      .duration(duration)
		      .style("stroke-opacity", 1)
		      .attr("d", connector_cubic);

		  // Transition exiting nodes to the parent's new position.
		  tl.exit().transition()
		      .duration(duration)
		      .style("stroke-opacity", 1e-6)
		      .attr("d", function(d) {
		        var o = {x: d.source.x, y: d.source.y};
		        return connector_cubic({source: o, target: o});
		      })
		      .remove();

		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });

	}

	function connector_elbow(d, i) {
	  return "M" + (d.source.y+CART_WIDTH) + "," + d.source.x
	  		+ "H" + ((d.source.y+CART_WIDTH) + d.target.y)*.5
	      	+ "V" + d.target.x + "H" + d.target.y;
	}

	function connector_cubic(d, i) {

		var xoffs = Math.abs(d.source.y-d.target.y)/7;

		var yoffs = 0;

		if(d.source.children && d.source.children.length > 1){
			for(var idx=0;idx<d.source.children.length; ++idx){
				if(d.source.children[idx].fullname == d.target.fullname){
					yoffs = (idx/(d.source.children.length-1)) * CART_FLAT_HEIGHT - CART_FLAT_HEIGHT/2;
				}
			}
	  	}

	  	return "M " + (d.source.y+CART_WIDTH) + " " + (d.source.x + yoffs)
	  		+ "C " + (d.source.y+CART_WIDTH + xoffs) + " " + (d.source.x + yoffs)
	  		+ " " + (d.target.y-xoffs) + " " + d.target.x
	  		+ " " + d.target.y + " " + d.target.x;
	}

	//expects an entry selection with a xlated g appended to it
	function drawNode(ne){

		ne.append("rect")
			.attr("x", 0)
			.attr("y", -CART_HEIGHT/2)
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("class", "cartouche")
			.attr("width", CART_WIDTH)
			.attr("height", CART_HEIGHT);

		ne.append("circle")
			.attr("r", NODE_R)
			.attr("class", "node")
		    .style("fill", function(d) { return getNodeColor(d); });


		ne.append("text").filter(function(d){
			return (d._children != null && d._children.length > 0) || (d.children != null && d.children.length > 0);
		})
			.attr("x", CART_WIDTH-NODE_R*2)
			.attr("y", 28-CART_HEIGHT/2)
			.attr("class","nodelabel")
			.text(">>");

		ne.append("text")
			.attr("x", 12)
			.attr("y", 13-CART_HEIGHT/2)
			.attr("class","nodelabel")
		    .text(function(d) { return d.name; });

		ne.append("text")
			.attr("x", 12)
			.attr("y", 28-CART_HEIGHT/2)
			.attr("class","nodelabel")
		    .text(function(d) { return d.pkg.fullname; });

	}

	// Toggle children on click.
	function onNodeClick(d) {

	  if (d.children) {
	    collapse(d);
	  } else {
	    expand(d);
	  }

	  bjstr.render(cached_svg, cached_info, cached_dat);
	}

	function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d.children = null;
	    }

	    if(d.children)
	    	d.children.forEach(collapse);
	  }

	function expand(d) {
	    if (d._children) {
	      d.children = d._children;
	      d._children = null;
	    }

	    if(d.children)
	    	d.children.forEach(expand);
	  }


	function getNodeColor(n){
		if(n.issyntharoot) return "#fff";

		if(bjstr.hilite == "critical" && n.critical == "Critical") return "red";

		if(bjstr.hilite == "untraced" && n.ancestors.length == 0 && n.formula == '') return "red";

		if(bjstr.colorPlan=="cat") {
			var cat = n.pkg.fullname.substring(0,7);
			return color(cat);
		}

		return color(n.pkg.fullname);
	}



	function nodeMouseOver(d) {
		bjstr.mouseOverItem(d);
	}

	function mouseOut() {
		bjstr.mouseOverItem(null);
	}


  return bjstr;
}
	
