/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>

namespace bjs {


		//arranging points on an axis (other than 'group by asset with a little gap between assets')
		//TODO: unify and generalize the arrangement of points into a line

    export function makeScale(nodea:bjs.node[], o:bjs.xyorder, min:number, max:number):any{

      switch(o){
        case bjs.xyorder.depth:
        return d3.scale.linear().range([min, max]).domain([0,d3.max(nodea, function(d:bjs.node){return d.field.ldepth;})]);
        case bjs.xyorder.shallowness:
        return d3.scale.linear().range([min, max]).domain([d3.max(nodea, function(d:bjs.node){return d.field.rdepth;}),0]);
        case bjs.xyorder.timing:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.asset.effnotbefore;})]);
        case bjs.xyorder.quality:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.effquality-1;})]);
        case bjs.xyorder.risk:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.effrisk;})]);
        case bjs.xyorder.importance:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.effimportance;})]);
        case bjs.xyorder.complexity:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.getComplexity();})]);
        case bjs.xyorder.influence:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.getInfluence();})]);
        case bjs.xyorder.filters:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.getFilters();})]);
        case bjs.xyorder.dependencies:
        return d3.scale.linear().range([min, max]).domain([0, d3.max(nodea, function(d:bjs.node){return d.field.getDependencies();})]);
        case bjs.xyorder.term:
        return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(nodea, function(d:bjs.node){return d.field.term?d.field.term.code:"na";}));
        case bjs.xyorder.type:
        return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(nodea, function(d:bjs.node){return d.field.asset?d.field.asset.type:"na";}));
        case bjs.xyorder.owner:
        return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(nodea, function(d:bjs.node){return d.field.asset?d.field.asset.owner:"na";}));
        case bjs.xyorder.asset:
        return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(nodea, function(d:bjs.node){return d.field.asset?d.field.asset.fullname:"na";}));
        case bjs.xyorder.dept:
        return d3.scale.ordinal().rangePoints([min, max]).domain(bjs.distinct(nodea, function(d:bjs.node){return d.field.asset?d.field.asset.dept:"na";}));
        case bjs.xyorder.focus:
        return d3.scale.ordinal().rangePoints([min, max]).domain(["N", "Y", ""]);
        
        default:
        return d3.scale.linear().range([min, max]).domain([d3.max(nodea, function(d:bjs.node){return d.field.rdepth;}),0]);
      }
    }

    export function getNodePos(n:bjs.node, o:bjs.xyorder, focus:bjs.filter, scale:any):number{

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
        case bjs.xyorder.influence:
        return scale(n.field.getInfluence());
        case bjs.xyorder.filters:
        return scale(n.field.getFilters());
        case bjs.xyorder.dependencies:
        return scale(n.field.getDependencies());
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
        case bjs.xyorder.focus:
        return scale(bjs_data_json.isMatch(n.field, focus)?"Y": "N");
        default:
        return scale(n.field.asset.rdepth);
      }

    }

    export function getAxisLabel(o:bjs.xyorder):string{
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
        case bjs.xyorder.influence:
        return "Influence";
        case bjs.xyorder.filters:
        return "Filters";
        case bjs.xyorder.dependencies:
        return "Dependencies";
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
        case bjs.xyorder.focus:
        return "Focus";
        default:
        return "Invalid Axis";
      }

    }
    
    export function sortFunction(o:bjs.xyorder, focus:bjs.filter, a:bjs.node, b:bjs.node):number{
      
      if(a.field == null || b.field == null) return 0;

      switch(o){
        case bjs.xyorder.depth:
        return a.field.ldepth - b.field.ldepth;
        case bjs.xyorder.shallowness:
        return a.field.rdepth - b.field.rdepth;
        case bjs.xyorder.timing:
        return a.field.asset.effnotbefore - b.field.asset.effnotbefore;
        case bjs.xyorder.quality:
        return a.field.effquality - b.field.effquality;
        case bjs.xyorder.risk:
        return a.field.effrisk - b.field.effrisk;
        case bjs.xyorder.importance:
        return a.field.effimportance - b.field.effimportance;
        case bjs.xyorder.complexity:
        return a.field.getComplexity() - b.field.getComplexity();
        case bjs.xyorder.influence:
        return a.field.getInfluence() - b.field.getInfluence();
        case bjs.xyorder.filters:
        return a.field.getFilters() - b.field.getFilters();
        case bjs.xyorder.dependencies:
        return a.field.getDependencies() - b.field.getDependencies();
        case bjs.xyorder.term:
          if(a.field.term==null || b.field.term == null) return 0;
          return bjs.strcmp(a.field.term.code, b.field.term.code);
        case bjs.xyorder.type:
          if(a.field.asset==null || b.field.asset == null) return 0;
          return bjs.strcmp(a.field.asset.type, b.field.asset.type);
        case bjs.xyorder.owner:
          if(a.field.asset==null || b.field.asset == null) return 0;
          return bjs.strcmp(a.field.asset.owner, b.field.asset.owner);
        case bjs.xyorder.asset:
          if(a.field.asset==null || b.field.asset == null) return 0;
          return bjs.strcmp(a.field.asset.fullname, b.field.asset.fullname);
        case bjs.xyorder.dept:
          if(a.field.asset==null || b.field.asset == null) return 0;
          return bjs.strcmp(a.field.asset.dept, b.field.asset.dept);
        case bjs.xyorder.focus:
          return (bjs_data_json.isMatch(a.field, focus)?1:0) - (bjs_data_json.isMatch(b.field, focus)?1:0);
        default:
        return 0;
      }

    }


    //points on a line, grouped by asset, with little gaps between assets.


    export function chainLayout(nodes:bjs.node[], groups:bjs.group[], fixedoffs:number, o:bjs.handed, separateGroups:boolean, min:number, max:number, node_r:number, groupbar_offs:number, group_overlap:number):void {

      if (nodes.length == 0) return;

      var numRegularNodes = 0,
        numBreaks = 0;

      var prevgroup = nodes[0].group.fullname;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].group.fullname != prevgroup && separateGroups) {
          numBreaks += 1;
          prevgroup = nodes[i].group.fullname;
        }

        numRegularNodes++;
      }

      var interval = (max-min) / (numRegularNodes + (numBreaks));

      var offs = min - interval / 2;
      var prevgroup = nodes[0].group.fullname;
      for (var i = 0; i < nodes.length; i++) {

        offs += interval;

        if (nodes[i].group && nodes[i].group.fullname != prevgroup && separateGroups) {
          offs += interval;
          prevgroup = nodes[i].group.fullname;
        }

        nodes[i].handed = o;

        if(o==bjs.handed.row){
        	nodes[i].x = offs;
        	nodes[i].y = fixedoffs;
        }else{
        	nodes[i].y = offs;
        	nodes[i].x = fixedoffs;
        }
      }

      if(groups != null){
        for (var j = 0; j < groups.length; ++j) {
          var p = groups[j];
          p.handed = o;
          bjs.fitGroupToNodesBar(p, group_overlap, groupbar_offs);
        }
    }

    }


    //layout groups around nodes

        export function fitGroupToNodesBox(g:bjs.group, r:number):void {

		var rec = extents(g.children).expand(r);
		g.x = rec.left;
		g.y = rec.top;
		g.width = rec.width();
		g.height = rec.height();
	}

	
	export function fitGroupToNodesBar(g:bjs.group, r:number, offs:number):void {
	    
	    var rec = extents(g.children);
	    var GROUPBAR_WIDTH = 20;

	    
	    switch(g.handed){
	    	case bjs.handed.left:
	    	case bjs.handed.column:
	    		g.x=rec.left-offs;
	    		g.y=rec.top-r;
	    		g.width=GROUPBAR_WIDTH;
	    		g.height = rec.height() + r*2;
	    		break;
	    	case bjs.handed.right:
	    		g.x=rec.right+offs;
	    		g.y=rec.top-r;
	    		g.width=GROUPBAR_WIDTH;
	    		g.height = rec.height() + r*2;
	    		break;
	    	case bjs.handed.row:
	    		g.x=rec.left-r;
	    		g.y=rec.top-offs;
	    		g.height=GROUPBAR_WIDTH;
	    		g.width = rec.width() + r*2;
	    		break;
	    	case bjs.handed.low:
	    		g.x=rec.centerx()-GROUPBAR_WIDTH/2;
	    		g.y=rec.top-r;
	    		g.width=GROUPBAR_WIDTH;
	    		g.height = rec.height() + r*2;
	    		break;
	    }
	}
	
	function extents(nodes:bjs.node[]):bjs.rect{
		
		var rec = new bjs.rect(1000000,1000000,0,0);
	    
	    for(var i=0;i<nodes.length;++i){
	        var n = nodes[i];
	        if(n.y < rec.top) rec.top = n.y;
	        if(n.y > rec.bottom) rec.bottom = n.y;
	        if(n.x < rec.left) rec.left = n.x;
	        if(n.x > rec.right) rec.right = n.x;
	    }
	    
	    return rec;
	}







}