
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class flow_view implements view{

	xScale = d3.scale.linear();


	svg: any = null;
	mv :bjs.mv = null;
	config: bjs.config = null;
	focus: bjs.filter=null;
	dims: bjs.dimensions=null;


	public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
		this.svg = svg;
		this.config = c;
		this.focus = f;
		this.dims=d;
		
		var mv = bjs.makeDirect(this, w);
		
		this.xScale = this.makeScale(mv, this.config);
		
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
	
	private makeScale(mv:bjs.mv, c:bjs.config):any{
		var scale = d3.scale.linear().range([this.dims.left_edge,this.dims.right_edge]);
		
		switch(c.floworder){
			case bjs.floworder.depth:
				scale.domain([0,d3.max(mv.groupa, function(d){return d.asset.ldepth;})]);
				break;
			case bjs.floworder.shallowness:
				scale.domain([d3.max(mv.groupa, function(d){return d.asset.rdepth;}),0]);
				break;
			case bjs.floworder.timing:
				scale.domain([0, d3.max(mv.groupa, function(d){return d.asset.effnotbefore;})]);
				break;
			default:
				scale.domain([d3.max(mv.groupa, function(d){return d.asset.rdepth;}),0]);
				break;
		}
		return scale;
	}
	
	private  xValue(g:bjs.group, c:bjs.config):number{
		switch(c.floworder){
			case bjs.floworder.depth:
				return g.asset.ldepth;
			case bjs.floworder.shallowness:
				return g.asset.rdepth;
			case bjs.floworder.timing:
				return g.asset.effnotbefore;
			default:
				return g.asset.ldepth;
		}
	}
	

	private layout(mv:bjs.mv):void {
		
		var tooDarnBig=(mv.nodea.length > this.dims.big_limit);
		
		var spacing = tooDarnBig?this.dims.node_r*.3:this.dims.node_r*2;
		var group_spacing = tooDarnBig?this.dims.group_spacing*1.8:this.dims.group_spacing;
		var upper_edge = tooDarnBig?this.dims.top_edge:this.dims.top_edge+100;

		var stax = {};
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			g.x = this.xScale(this.xValue(g, this.config));
			g.height = g.children.length * spacing + group_spacing;
			g.width = this.dims.groupbar_width;
			if (stax[g.x] == null) {
				stax[g.x] = upper_edge + g.height + group_spacing; 
				g.y = upper_edge;
			}
			else {
				g.y = stax[g.x];
				stax[g.x] += g.height + group_spacing;
			}
		}
		
		


		//now do the y locations of nodes
		//for now lets just assume they are, eh, wherever.
		//nodes are already sorted by groupname/fullname
		for (var fullname in mv.groups) {
			var g = mv.groups[fullname];
			for (var i = 0; i < g.children.length; ++i) {
				var node = g.children[i];
				node.y = g.y + i * spacing + this.dims.node_r / 2 + group_spacing / 2;
				node.x = g.x + this.dims.groupbar_width / 2;
			}
		}
		
		
		for(var i=0;i<mv.nodea.length;++i){
			mv.nodea[i].handed = tooDarnBig?bjs.handed.none:bjs.handed.leftright;
		}


		//hack -- do what the position module would do if it were here (roughly)
		for(var i=0; i< mv.nodea.length; ++i){
			var n = mv.nodea[i];
			if(n.fullname.indexOf("Reference.Agency.Files")!=-1)
				n.y += 200;
			if(n.fullname.indexOf("Restruct_Mods")!=-1)
				n.y += 120;
			if(n.fullname.indexOf("CustQuality")!=-1)
				n.y += 200;
			if(n.fullname.indexOf("Compliance")!=-1)
				n.y += 200;
			
			
		}

		//despite having just positioned groups manually, we now fit them to their nodes... needs sorting out really
		for(var fullname in mv.groups){
			bjs.fitGroupToNodesBox(mv.groups[fullname], this.dims.node_r*2);
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

		var boff = this.dims.bundle_offs;

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

	private renderLinks(svg:any, c:bjs.config, linkdata:bjs.link[]):void {
		
		var config = this.config;
		var focus = this.focus;

		var links = svg.selectAll(".link")
			.data(linkdata, function(d, i) {
				return d.source.fullname + d.target.fullname;
			});


		links
			.enter()
			.append("path")
			.attr("class", "link");

		var boff = this.dims.bundle_offs;

		links
			.transition().duration(this.dims.duration)
			.attr("d", function(d) {return bjs.getLinkPath(d, boff, true, true);})
			.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);});

		links
			.exit()
			.transition().duration(this.dims.duration).style("opacity", 0)
			.remove();
	}

	private renderGroups(svg:any, c:bjs.config, groups:bjs.IMap<bjs.group>):void {

		var datarray = [];

		for (var groupname in groups) {
			datarray.push(groups[groupname]);
		}
		
		svg.selectAll("#groupholder")
				.data([1]).enter()
				.append("g")
				.attr("id", "groupholder");
				
		var gholder = svg.selectAll("#groupholder");

		var groupfather = gholder.selectAll(".group")
			.data(datarray, function(d, i) {
				return d.fullname;
			});

		var groupsg = groupfather
			.enter()
			.append("g")
			.attr("class", "group")
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.on("mouseover", this.groupMouseOver)
			.on("mouseout", this.mouseOut)
			.on("click", this.groupClick);
			
		bjs.drawGroupBox(groupfather, groupsg, this.config, 4);


		var groupsupdate = groupfather
			.transition().duration(this.dims.duration)
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
			
			groupfather
			.call(d3.behavior.drag()
				.origin(function(d) {
					return d;
				})
				.on("dragstart", function() {
					this.parentNode.appendChild(this);
				})
				.on("drag", this.gdragmove)
				.on("dragend", this.dragend));
		

		var groupexit = groupfather.exit().remove();

	}

	private renderNodes(svg:any, c:bjs.config, ndata:bjs.node[]):void {

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

		bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, false, false);

		var nodeupdate = nodes
			.transition().duration(this.dims.duration)
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

		bjs.fitGroupToNodesBox(d.group, this.dims.node_r*2);

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
