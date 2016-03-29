/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_layout.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class scatter_view implements view{

		BUNDLE_OFFSET = 150;

		xScale = null;
		yScale = null;
		xAxis = null
		yAxis = null;

		left_axis_x:number=0;


		svg: any = null;
		mv :bjs.mv = null;
		config: bjs.config = null;
		focus: bjs.filter=null;
		dims:bjs.dimensions=null;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
			this.svg = svg;
			this.config = c;
			this.focus = f;
			this.dims=d;
			this.left_axis_x = this.dims.left_edge + 120;

			this.mv = bjs.makeDirect(this, w);

			this.xScale = this.makeXScale(this.mv, this.config);
			this.yScale = this.makeYScale(this.mv, this.config);

			this.xAxis = d3.svg.axis().scale(this.xScale);
			this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");

			this.positionAndMergeNodes(this.mv.nodea, this.config);

			//we don't draw the groups, but perhaps this will allow bundling?
			//works sometimes, not other times, depending on layout... not bundling 
			for(var fullname in this.mv.groups){
				bjs.fitGroupToNodesBox(this.mv.groups[fullname], this.dims.node_r*2);
			}
/*
		    d3.select("body").append("svg")
			    .attr("class", "axis")
			    .attr("width", 1440)
			    .attr("height", 30)
				  .append("g")
				    .attr("transform", "translate(0,30)")
				    .call(this.yAxis);
*/
			this.renderAxes(this.svg);
			this.renderLinks(this.svg, this.config, this.mv.links);
			this.renderNodes(this.svg, this.config, this.mv.nodea);
		}

		private positionAndMergeNodes(nodes:bjs.node[], c:bjs.config):void{

			var full = {};

			//give them all x and y coords
			//if two have the same coords, create a logical node for that location.
			this.mv.nodea.forEach(function(d:bjs.node){
				d.handed = bjs.handed.leftright;
				d.x = bjs.getNodePos(d, c.xorder, this.xScale);
				d.y = bjs.getNodePos(d, c.yorder, this.yScale);
				if(isNaN(d.x))d.x = 0;
				if(isNaN(d.y))d.y = 0;
				var loc = d.x + ", " + d.y;
				while(full[loc]){
					d.y -= this.dims.node_r*.8;
					loc = d.x + ", " + d.y;
				}
				full[loc] = d;
			},this);
		}

		private makeXScale(mv:bjs.mv, c:bjs.config):any{
			return bjs.makeScale(mv.nodea, c.xorder, this.left_axis_x, this.dims.right_edge);
		}

		private makeYScale(mv:bjs.mv, c:bjs.config):any{
			return bjs.makeScale(mv.nodea, c.yorder, this.dims.bottom_edge, this.dims.top_edge);
		}

		private getNodeY(n:bjs.node, c:bjs.config, scale:any):number{
			var y= scale(n.field.asset.fullname);
			return y;
		}

	
		private renderAxes(svg:any):void{
			var xax = svg.selectAll(".xaxis").data([1]);

			xax	
				.enter()
				.append("g")
				.append("text")
					.attr("class", "biglabel")
					.attr("x", this.left_axis_x)
					.attr("y", 40);

			xax
				.attr("class", "xaxis")
			    .attr("transform", "translate("+0+"," + (this.dims.bottom_edge + 40) + ")")
			    .call(this.xAxis);

			xax
				.select(".biglabel")
				.text(bjs.getAxisLabel(this.config.xorder));


			var yax = svg.selectAll(".yaxis").data([1]);

			yax	
				.enter()
				.append("g")
				.append("text")
					.attr("class", "biglabel")
					.attr("x", -50)
					.attr("y", 32);

			yax
				.attr("class", "yaxis")
			    .attr("transform", "translate("+ (this.left_axis_x - 90) + "," + 0 + ")")
			    .call(this.yAxis);

			yax
				.select(".biglabel")
				.text(bjs.getAxisLabel(this.config.yorder));



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
				.attr("d", function(d) {return bjs.getLinkPath(d, boff, true, false);})
				.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);});

			links
				.exit()
				.transition(800).style("opacity", 0)
				.remove();
		}

		private renderNodes(svg:any, c:bjs.config, ndata:bjs.node[]):void {

			//var getNodePos = this.getNodePos;
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

			bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, false, false);

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