/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var svg:any;

namespace bjs {

	export class scatter_view implements view{

		NODE_R = 8;
		LEFT_EDGE = 210;
		RIGHT_EDGE = 1000;
		TOP_EDGE = 50;
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
		dims:bjs.dimensions=null;


		public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
			this.svg = svg;
			this.config = c;
			this.focus = f;
			this.dims=d;

			this.mv = bjs.makeDirect(this, w);

			this.xScale = this.makeXScale(this.mv, this.config);
			this.yScale = this.makeYScale(this.mv, this.config);

			this.xAxis = d3.svg.axis().scale(this.xScale);
			this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");

			this.positionAndMergeNodes(this.mv.nodea, this.config);

			//we don't draw the groups, but perhaps this will allow bundling?
			//works sometimes, not other times, depending on layout... not bundling 
			for(var fullname in this.mv.groups){
				bjs.fitGroupToNodesBox(this.mv.groups[fullname], this.NODE_R*2);
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
				d.x = this.getNodePos(d, c.xorder, this.xScale);
				d.y = this.getNodePos(d, c.yorder, this.yScale);
				if(isNaN(d.x))d.x = 0;
				if(isNaN(d.y))d.y = 0;
				var loc = d.x + ", " + d.y;
				while(full[loc]){
					d.y += this.NODE_R;
					loc = d.x + ", " + d.y;
				}
				full[loc] = d;
			},this);
		}

		private makeXScale(mv:bjs.mv, c:bjs.config):any{
			return this.makeScale(mv, c.xorder, this.LEFT_EDGE, this.RIGHT_EDGE);
		}

		private makeYScale(mv:bjs.mv, c:bjs.config):any{
			return this.makeScale(mv, c.yorder, this.BOTTOM_EDGE, this.TOP_EDGE);
		}

		private makeScale(mv:bjs.mv, o:bjs.xyorder, min:number, max:number):any{

			switch(o){
				case bjs.xyorder.depth:
				return d3.scale.linear().range([min, max]).domain([0,d3.max(mv.nodea, function(d:bjs.node){return d.field.ldepth;})]);
				case bjs.xyorder.shallowness:
				return d3.scale.linear().range([min, max]).domain([d3.max(mv.nodea, function(d:bjs.node){return d.field.rdepth;}),0]);
				case bjs.xyorder.timing:
				return d3.scale.linear().range([min, max]).domain([0, d3.max(mv.groupa, function(d:bjs.group){return d.asset.effnotbefore;})]);
				case bjs.xyorder.quality:
				return d3.scale.linear().range([min, max]).domain([0, d3.max(mv.nodea, function(d:bjs.node){return d.field.effquality-1;})]);
				case bjs.xyorder.risk:
				return d3.scale.linear().range([min, max]).domain([0, d3.max(mv.nodea, function(d:bjs.node){return d.field.effrisk;})]);
				case bjs.xyorder.importance:
				return d3.scale.linear().range([min, max]).domain([0, d3.max(mv.nodea, function(d:bjs.node){return d.field.effimportance;})]);
				case bjs.xyorder.complexity:
				return d3.scale.linear().range([min, max]).domain([0, d3.max(mv.nodea, function(d:bjs.node){return d.field.getComplexity();})]);
				case bjs.xyorder.term:
				return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(mv.nodea, function(d:bjs.node){return d.field.term?d.field.term.code:"na";}));
				case bjs.xyorder.type:
				return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(mv.nodea, function(d:bjs.node){return d.field.asset?d.field.asset.type:"na";}));
				case bjs.xyorder.owner:
				return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(mv.nodea, function(d:bjs.node){return d.field.asset?d.field.asset.owner:"na";}));
				case bjs.xyorder.asset:
				return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(mv.nodea, function(d:bjs.node){return d.field.asset?d.field.asset.fullname:"na";}));
				case bjs.xyorder.dept:
				return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(mv.nodea, function(d:bjs.node){return d.field.asset?d.field.asset.dept:"na";}));
				
				default:
				return d3.scale.linear().range([min, max]).domain([d3.max(mv.nodea, function(d:bjs.node){return d.field.rdepth;}),0]);
			}
		}

		private getNodePos(n:bjs.node, o:bjs.xyorder, scale:any):number{

			switch(o){
				case bjs.xyorder.depth:
				return scale(n.field.ldepth);
				case bjs.xyorder.shallowness:
				return scale(n.field.rdepth);
				case bjs.xyorder.timing:
				return scale(n.field.asset.effnotbefore);
				case bjs.xyorder.quality:
				return scale(n.field.effquality-1);
				case bjs.xyorder.risk:
				return scale(n.field.effrisk);
				case bjs.xyorder.importance:
				return scale(n.field.effimportance);
				case bjs.xyorder.complexity:
				return scale(n.field.getComplexity());
				case bjs.xyorder.term:
				return scale(n.field.term?n.field.term.code:"na");
				case bjs.xyorder.type:
				return scale(n.field.asset?n.field.asset.type:"na");
				case bjs.xyorder.owner:
				return scale(n.field.asset?n.field.asset.owner:"na");
				case bjs.xyorder.asset:
				return scale(n.field.asset?n.field.asset.fullname:"na");
				case bjs.xyorder.dept:
				return scale(n.field.asset?n.field.asset.dept:"na");
				default:
				return scale(n.field.asset.rdepth);
			}

		}

		private getNodeY(n:bjs.node, c:bjs.config, scale:any):number{
			var y= scale(n.field.asset.fullname);
			return y;
		}

		private getAxisLabel(o:bjs.xyorder):string{
			switch(o){
				case bjs.xyorder.depth:
				return "Steps from Source";
				case bjs.xyorder.shallowness:
				return "Steps from Output";
				case bjs.xyorder.timing:
				return "Ready on Working Day";
				case bjs.xyorder.quality:
				return "Error Factor";
				case bjs.xyorder.risk:
				return "Risk Level";
				case bjs.xyorder.importance:
				return "Importance";
				case bjs.xyorder.complexity:
				return "Complexity";
				case bjs.xyorder.term:
				return "Business Term";
				case bjs.xyorder.type:
				return "Asset Type";
				case bjs.xyorder.owner:
				return "Asset Owner";
				case bjs.xyorder.asset:
				return "Asset Name";
				case bjs.xyorder.dept:
				return "Asset Department";
				default:
				return "Invalid Axis";
			}

		}

		private renderAxes(svg:any):void{
			var xax = svg.selectAll(".xaxis").data([1]);

			xax	
				.enter()
				.append("g")
				.append("text")
					.attr("class", "biglabel")
					.attr("x", this.LEFT_EDGE)
					.attr("y", 40);

			xax
				.attr("class", "xaxis")
			    .attr("transform", "translate("+0+"," + (this.BOTTOM_EDGE + 40) + ")")
			    .call(this.xAxis);

			xax
				.select(".biglabel")
				.text(this.getAxisLabel(this.config.xorder));


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
			    .attr("transform", "translate("+ (this.LEFT_EDGE - 90) + "," + 0 + ")")
			    .call(this.yAxis);

			yax
				.select(".biglabel")
				.text(this.getAxisLabel(this.config.yorder));



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