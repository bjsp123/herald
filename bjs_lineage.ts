
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class flow_view implements view{

	NODE_R = 8;
	OUTPUT_GROUP_X = 1050;
	GROUP_INTERVAL_X = 400;
	UNDLE_OFFSET = 120;
	AXIS_HEIGHT = 1000;
	TOP_MARGIN = 200;
	GROUPBAR_WIDTH = 20;
	GROUP_PADDING = 20;
	BUNDLE_OFFSET = 50;
	INVALID_DEPTH = 999; ///remember programming like this?
	color = d3.scale.category20();


	svg: any = null;
	mv :bjs.mv = null;
	config: bjs.config = null;


	public render(svg, w:bjs.world, c:bjs.config):void {
		this.svg = svg;
		this.config = c;
		
		var mv = bjs.makeDirect(this, w);
		
		this.layout(mv);
		
		this.mv = mv;

		this.renderGroups(svg, c, mv.groups);

		if (c["renderSummary"]) {
			this.renderGLinks(svg, c, mv.glinks);
			this.renderLinks(svg, c, []);
		}
		else {
			this.renderGLinks(svg, c, []);
			this.renderLinks(svg, c, mv.links);
		}

		this.renderNodes(svg, c, mv.nodea);
	}
	

	private layout(mv:bjs.mv):void {

		//arrange groups into 3 depth levels -- this simple approach isn't all that effective.
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			g.depth = 1;
			if (!g.asset.hasTargets()) g.depth = 0;
			if (!g.asset.hasSources()) g.depth = 2;
		}


		var stax = {};
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			g.x = this.OUTPUT_GROUP_X - (g.depth * this.GROUP_INTERVAL_X);
			g.height = g.children.length * this.NODE_R + this.GROUP_PADDING;
			g.width = this.GROUPBAR_WIDTH;
			if (stax[g.x] == null) {
				stax[g.x] = this.TOP_MARGIN + g.height + this.GROUP_PADDING;
				g.y = this.TOP_MARGIN;
			}
			else {
				g.y = stax[g.x];
				stax[g.x] += g.height + this.GROUP_PADDING;
			}
		}


		//now do the y locations of nodes
		//for now lets just assume they are, eh, wherever.
		//nodes are already sorted by groupname/fullname
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			for (var i = 0; i < g.children.length; ++i) {
				var node = g.children[i];
				node.y = g.y + i * this.NODE_R + this.NODE_R / 2 + this.GROUP_PADDING / 2;
				node.x = g.x + this.GROUPBAR_WIDTH / 2;
			}
		}
		
		for(var i=0;i<mv.nodea.length;++i){
			mv.nodea[i].handed = bjs.handed.leftright;
		}

		//despite having just positioned groups manually, we now fit them to their nodes... needs sorting out really
		for(var fullname in mv.groups){
			bjs.fitGroupToNodesBox(mv.groups[fullname], this.NODE_R*2);
		}
	}



	private renderGLinks(svg, c, glinkdata) {

		var links = svg.selectAll(".glink")
			.data(glinkdata, function(d, i) {
				return d.source.fullname + d.target.fullname;
			});


		links
			.enter()
			.append("path")
			.attr("class", "glink")
			.attr("stroke-width", function(d) {
				return d.size / 2 + 1;
			});

		var boff = this.BUNDLE_OFFSET;

		links
			.attr("d", function(d) {
				return "M " + d.source.x + " " + (d.source.y + d.source.height / 2) +
					"C " + (d.source.x + boff) + " " + (d.source.y + d.source.height / 2) +
					" " + (d.target.x - boff) + " " + (d.target.y + d.target.height / 2) +
					" " + d.target.x + " " + (d.target.y + d.target.height / 2);
			});

		links
			.exit()
			.remove();

	}

	private renderLinks(svg, c, linkdata) {

		var links = svg.selectAll(".link")
			.data(linkdata, function(d, i) {
				return d.source.fullname + d.target.fullname;
			});


		links
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("stroke", bjs.getLinkColor);

		var boff = this.BUNDLE_OFFSET;

		links
			.attr("d", function(d) {
				return "M " + d.source.x + " " + (d.source.y + Math.random() * 3) +
					"C " + (d.source.x + boff) + " " + (d.source.y) +
					" " + (d.target.x - boff) + " " + (d.target.y) +
					//"C " + (dat.groups[d.source.groupname].x+BUNDLE_OFFSET) + " " + (dat.groups[d.source.groupname].y + dat.groups[d.source.groupname].height/2) +
					//" " + (dat.groups[d.target.groupname].x-BUNDLE_OFFSET) + " " + (dat.groups[d.target.groupname].y + dat.groups[d.target.groupname].height/2) +
					" " + d.target.x + " " + (d.target.y + Math.random() * 3);
			});

		links
			.exit()
			.remove();
	}

	private renderGroups(svg, c, groups) {

		var datarray = [];

		for (var groupname in groups) {
			datarray.push(groups[groupname]);
		}
		
		svg.selectAll("#groupholder")
				.data([1]).enter()
				.append("g")
				.attr("id", "groupholder");
				
		var gholder = svg.selectAll("#groupholder");

		var groups = gholder.selectAll(".group")
			.data(datarray, function(d, i) {
				return d.fullname;
			});

		var groupsg = groups
			.enter()
			.append("g")
			.attr("class", "group")
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.on("mouseover", this.groupMouseOver)
			.on("mouseout", this.mouseOut)
			.on("click", this.groupClick);
			
		bjs.drawGroupBox(groups, groupsg, this.color, this.config, 4);


		var groupsupdate = groups
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.call(d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", function() {
					this.parentNode.appendChild(this);
				})
				.on("drag", this.gdragmove)
				.on("dragend", this.dragend));
		

		var groupexit = groups.exit().remove();

	}

	private renderNodes(svg, c, ndata) {

		var nodes = svg
			.selectAll(".nodegrp")
			.data(ndata, function(d) {
				return d.fullname;
			});

		var nodesg = nodes
			.enter()
			.append("g")
			.attr("class", "nodegrp")
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.on("mouseover", this.nodeMouseOver)
			.on("mouseout", this.mouseOut);

		bjs.drawNodes(nodes, nodesg, this.color, this.config, this.NODE_R, false, false);

		var nodeupdate = nodes
			//.transition()
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

		nodes.select("circle")
			.call(d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", function() {
					this.parentNode.appendChild(this);
				})
				.on("drag", this.dragmove)
				.on("dragend", this.dragend));

		var nodeexit = nodes.exit().remove();

	} 


	private gdragmove(d) {
		d.view.innergdragmove(d);
	}
	
	private innergdragmove(d){

		d.x += d3.event.dx;
		d.y += d3.event.dy;

		for (var i = 0; i < d.children.length; ++i) {
			var node = d.children[i];
			node.x += d3.event.dx;
			node.y += d3.event.dy;
		}
		this.renderGroups(this.svg, this.config, this.mv.groups);
	}

	private dragend(d) {
		d.view.innerdragend(d);
	}
	
	private innerdragend(d){
		if (this.config["renderSummary"])
			this.renderGLinks(this.svg, this.config, this.mv.glinks);
		else
			this.renderLinks(this.svg, this.config, this.mv.links);

		this.renderGroups(this.svg, this.config, this.mv.groups);
		this.renderNodes(this.svg, this.config, this.mv.nodea);
	}

	private dragmove(d) {
		d.view.innerdragmove(d);
	}
	
	private innerdragmove(d) {

		d.x += d3.event.dx;
		d.y += d3.event.dy;

		bjs.fitGroupToNodesBox(d.group, this.NODE_R*2);

		this.renderNodes(this.svg, this.config, this.mv.nodea);
	}

	private linkMouseOver(d) {}

	private groupMouseOver(d) {
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

	private groupClick(d) {
		//not used
	}

}

}
