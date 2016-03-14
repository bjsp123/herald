// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class scatter_view implements view{

		NODE_R = 8;
		LEFT_EDGE = 100;
		RIGHT_EDGE = 1000;
		TOP_EDGE = 100;
		BOTTOM_EDGE = 900;
		BUNDLE_OFFSET = 150;

		xScale = null;
		yScale = null;
		xAxis = null;
		yAxis = null;


		svg: any = null;
		mv :bjs.mv = null;
		config: bjs.config = null;
		focus: bjs.filter=null;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter):void {
			this.svg = svg;
			this.config = c;
			this.focus = f;

			this.mv = bjs.makeDirect(this, w);

			this.xScale = this.makeXScale(this.mv, this.config);
			this.yScale = this.makeYScale(this.mv, this.config);

			this.positionAndMergeNodes(this.mv.nodea, this.config);

			//we don't draw the groups, but perhaps this will allow bundling?
			for(var fullname in this.mv.groups){
				bjs.fitGroupToNodesBox(this.mv.groups[fullname], this.NODE_R*2);
			}

			this.renderLinks(this.svg, this.config, this.mv.links);
			this.renderNodes(this.svg, this.config, this.mv.nodea);
		}

		private positionAndMergeNodes(nodes:bjs.node[], c:bjs.config):void{

			var full = {};

			//give them all x and y coords
			//if two have the same coords, create a logical node for that location.
			this.mv.nodea.forEach(function(d:bjs.node){
				d.handed = bjs.handed.leftright;
				d.x = this.getNodeX(d, c, this.xScale);
				d.y = this.getNodeY(d, c, this.yScale);
				var loc = d.x + ", " + d.y;
				while(full[loc]){
					d.y += this.NODE_R;
					loc = d.x + ", " + d.y;
				}
				full[loc] = d;
			},this);

		}

		private makeXScale(mv:bjs.mv, c:bjs.config):any{
			var scale = d3.scale.linear().range([this.LEFT_EDGE,this.RIGHT_EDGE]);

			switch(c.xorder){
				case bjs.xorder.depth:
				scale.domain([0,d3.max(mv.nodea, function(d:bjs.node){return d.field.ldepth;})]);
				break;
				case bjs.xorder.shallowness:
				scale.domain([d3.max(mv.nodea, function(d:bjs.node){return d.field.rdepth;}),0]);
				break;
				case bjs.xorder.timing:
				scale.domain([0, d3.max(mv.groupa, function(d:bjs.group){return d.asset.effnotbefore;})]);
				break;
				default:
				scale.domain([d3.max(mv.groupa, function(d:bjs.group){return d.asset.rdepth;}),0]);
				break;
			}
			return scale;
		}

		private makeYScale(mv:bjs.mv, c:bjs.config):any{

			//var scale = d3.scale.ordinal().rangePoints([this.TOP_EDGE, this.BOTTOM_EDGE]);
			var scale = d3.scale.ordinal().range(d3.range(this.TOP_EDGE, this.BOTTOM_EDGE, 26));

			return scale;
		}

		private getNodeX(n:bjs.node, c:bjs.config, scale:any):number{

			switch(c.xorder){
				case bjs.xorder.depth:
				return scale(n.field.ldepth);
				case bjs.xorder.shallowness:
				return scale(n.field.rdepth);
				case bjs.xorder.timing:
				return scale(n.field.asset.effnotbefore);
				default:
				return scale(n.field.asset.rdepth);
			}

		}

		private getNodeY(n:bjs.node, c:bjs.config, scale:any):number{
			var y= scale(n.field.asset.fullname);
			return y;
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

			var boff = this.BUNDLE_OFFSET;

			links
				.transition()
				.attr("d", function(d) {return bjs.getLinkPath(d, boff, true, true);})
				.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);});

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderNodes(svg:any, c:bjs.config, ndata:bjs.node[]):void {

			var getNodeX = this.getNodeX;
			var getNodeY = this.getNodeY;
			var xScale = this.xScale;
			var yScale = this.yScale;

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

			bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.NODE_R, false, false);

			var nodeupdate = nodes
			.transition()
			.attr("transform", function(d) {
				var foo = "translate(" + d.x + "," + d.y + ")";
				return foo;
			});

			var nodeexit = nodes.exit().remove();

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


		groupfather
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		

		var groupexit = groupfather.exit().remove();

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
	}




}