/// <reference path="bjs_types.ts"/>

namespace bjs {
    
    export const enum handed {
        left,
        right,
        low,
        row,
        column,
        leftright
    }
    
    export class rect{
        constructor(public top:number, public left:number, public bottom:number, public right:number){
        }
        public height():number{return this.bottom-this.top;}
        public width():number{return this.right-this.left;}
        public centerx():number{return (this.right+this.left)/2;}
        public expand(r:number):rect{return new rect(this.top-r, this.left-r,this.bottom+r,this.right+r);}
    }


    export function getNodeColor(color:any, config:bjs.config, n:bjs.node):string {
        if (config.hilite=="critical" && n.field.flags && n.field.flags.indexOf("critical") != -1) return "red";

        if (config.hilite == "untraced" && n.field.sources.length == 0 && n.field.formula == '') return "red"

        if (n.group) {
            return getColorFromName(color, config, n.group.fullname);
        }
        else {
            return getColorFromName(color, config, n.field.asset.fullname);
        }
    }
    
    export function getLinkColor(l:bjs.link):string {
        if(l.rel.type=="filter") return "#777";
        
        return "blue";
    }

    export function getColorFromName(color:any, config:bjs.config, fullname:string) {

        if (!fullname) fullname = "unknown";

        if (config.colorPlan == "cat") {
            var cat = fullname.substring(0, 7);
            return color(cat);
        }

        return color(fullname);
    }

    export function areNodesRelated(a:bjs.node, b:bjs.node):boolean {
        if(a.itemtype != "node" || b.itemtype != "node") return false;
        if (a.fullname == b.fullname) return true;
        for (var fullname in a.field.ancestors) {
            if (fullname == b.fullname) return true;
        }
         for (var fullname in a.field.descendants) {
            if (fullname == b.fullname) return true;
        }
        return false;
    }

    export function isNodeRelatedToGroup(n:bjs.node, g:bjs.group):boolean {
        if(n.itemtype != "node" || g.itemtype != "group") return false;
        if (n.group.fullname == g.fullname) return true;
        for (var fullname in n.field.ancestors) {
            if (n.mv.world.fields[fullname].asset.fullname == g.fullname) return true;
        }
         for (var fullname in n.field.descendants) {
            if (n.mv.world.fields[fullname].asset.fullname == g.fullname) return true;
        }
        return false;
    }

    export function shortenString(str:string, len:number):string {
        if (str.length <= len) return str;

        var bit = len / 2 - 1;

        return str.substring(0, bit) + "..." + str.substring(str.length - bit, str.length);
    }

    export function breakPath(str:string):string{
        return str.replace("/", "/ ").replace("\\", "\\ ");
    }
    
    
    export function drawGroupBox(groupsel:any, groupsenter:any, color:any, config:bjs.config, corners:number){
    	
    	groupsenter.append("rect");
		groupsenter.append("text");

		groupsel.select("rect")
			.attr("x",0)
			.attr("width", function(d) {
				return d.width;
			})
			.style("fill", function(d) {
				return bjs.getColorFromName(color, config, d.fullname);
			})
			.attr("y", 0)
			.attr("rx", corners)
			.attr("ry", corners)
			.attr("height", function(d) {
				return d.height;
			});
			

		groupsel.select("text")
			.attr("class", "grouplabel")
			.text(function(d) {
				return bjs.shortenString(d.fullname, 30);
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d) {
				return d.width / 2;
			})
			.attr("y", function(d, i) {
				return d.height + 4;
			});
    	
    }
    
    export function drawGroupBar(groupsel:any, groupsenter:any, color:any, config:bjs.config):void{
    	
    	groupsenter.append("rect").attr("class", "grouprect");
		groupsenter.append("line").attr("class", "grouplinetop group");
		groupsenter.append("line").attr("class", "grouplinebottom group");;
		groupsenter.append("text").attr("class", "grouplabel");
		
		function getlabelx(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return -20;
			    case bjs.handed.right:
			        return 20+d.width;
			   case bjs.handed.low:
			        return 0;
			   case bjs.handed.row:
			   		return d.width/2-10;
			   case bjs.handed.column:
			   		return -10;
			   	case bjs.handed.leftright:
			   		return; d.x<300?-20:20+d.width;
			   default:
			   		return 0;
			}
		}
		
		function getlabely(d:bjs.group){
			switch(d.handed){
			case bjs.handed.left:
		        return d.height/2;
		    case bjs.handed.right:
		        return d.height/2;
			   case bjs.handed.low:
			       return d.height+15;
			   case bjs.handed.row:
			   		return -5;
			   	case bjs.handed.column:
			   		return d.height/2-10;
			   default:
			   		return 0;
			}
		}
		
		function gettextanchor(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return "end";
			   case bjs.handed.low:
			       return "middle";
			    case bjs.handed.column:
			    	return "end";
			   	case bjs.handed.column:
			   		return "end";
			    case bjs.handed.leftright:
			   		return; d.x<300?"end":"start";
			    default:
			    	return "start";
			}
		}
		
		function getgrouplinedx(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return d.width*1.5;
			    case bjs.handed.right:
			        return -d.width/2;
			   case bjs.handed.row:
			   		return 0;
			   case bjs.handed.column:
			   		return d.width*1.5;
			   default:
			   		return 0;
			}
		}
		
		function getgrouplinedy(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return 0;
			    case bjs.handed.right:
			        return 0;
			   case bjs.handed.row:
			   		return d.height*1.5;
			   case bjs.handed.column:
			   		return 0;
			   default:
			   		return 0;
			}
		}
		
		function getgroupline2ndx(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return 0;
			    case bjs.handed.right:
			        return 0;
			   case bjs.handed.row:
			   		return d.width;
			   case bjs.handed.column:
			   		return 0;
			   default:
			   		return 0;
			}
		}
		
		function getgroupline2ndy(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.left:
			        return d.height;
			    case bjs.handed.right:
			        return d.height;
			   case bjs.handed.row:
			   		return 0;
			   case bjs.handed.column:
			   		return d.height;
			   default:
			   		return 0;
			}
		}
		
		function getrotation(d:bjs.group){
			switch(d.handed){
			    case bjs.handed.column:
			    case bjs.handed.row:
			   		return "rotate(-45 " + getlabelx(d) + "," + getlabely(d) + ")";
			    default:
			    	return "";
			}
			
		}
		


		groupsel.select("rect")
			.attr("x", 0)
			.attr("width", function(d){return d.width;})
			.style("fill", function(d) {
				return bjs.getColorFromName(color, config, d.fullname);
			})
			.attr("y", 0)
			.attr("height", function(d) {return d.height;});

		groupsel.select("text")
			.attr("class", "grouplabel")
			.text(function(d) {
				return bjs.shortenString(d.fullname, 24);
			})
			.attr("x", function(d){return getlabelx(d);})
			.attr("text-anchor", function(d){return gettextanchor(d);})
			.attr("y",function(d){return getlabely(d);})
			.attr("transform", function(d){return getrotation(d);})
			;
			
			
		groupsel.select(".grouplinetop")
			.attr("x1", function(d){return 0;})
			.attr("x2", function(d){return 0 + getgrouplinedx(d);})
			.attr("y1", function(d){return 0;})
			.attr("y2", function(d){return 0 + getgrouplinedy(d);});

		groupsel.select(".grouplinebottom")
			.attr("x1", function(d){return 0 + getgroupline2ndx(d);})
			.attr("x2", function(d){return 0 + getgroupline2ndx(d) + getgrouplinedx(d);})
			.attr("y1", function(d){return 0 + getgroupline2ndy(d);})
			.attr("y2", function(d){return 0 + getgroupline2ndy(d) + getgrouplinedy(d);});
    }
    
    
    export function drawNodes(nodesel:any, nodesenter:any, color:any, config:bjs.config, r:number, invisrect:boolean, longname:boolean):void{
        //nodesenter.append("rect");
		nodesenter.append("circle");
		nodesenter.append("text");
		
		var labelx=0,labely=0,labeltheta=0;
		var x=0,y=0;
		var textanchor="start";
		
		function getlabelx(d:bjs.node){
			switch(d.handed){
			    case bjs.handed.left:
			        return -20;
			    case bjs.handed.right:
			        return 20;
			   case bjs.handed.leftright:
			        return 20;
			   case bjs.handed.low:
			        return 0;
			   case bjs.handed.row:
			   		return 10;
			   case bjs.handed.column:
			   		return -20;
			   	case bjs.handed.leftright:
			   		return d.x<300?-20:20;
			   default:
			   		return 0;
			}
		}
		
		function getlabely(d:bjs.node){
			switch(d.handed){
			    
			   case bjs.handed.low:
			       return 15;
			   case bjs.handed.row:
			   		return -15;
			   default:
			   		return 0;
			}
		}
		
		function gettextanchor(d:bjs.node){
			switch(d.handed){
			    case bjs.handed.left:
			        return "end";
			   case bjs.handed.low:
			       return "middle";
			    case bjs.handed.column:
			    	return "end";
			    case bjs.handed.leftright:
			   		return d.x<300?"end":"start";
			    default:
			    	return "start";
			}
		}
		
		function getrotation(d:bjs.node){
			switch(d.handed){
			    case bjs.handed.column:
			    case bjs.handed.row:
			   		return "rotate(-45)";
			    default:
			    	return "";
			}
			
		}
		
        if(invisrect){
        	/*
    		nodesg.select("rect")
    			.attr("class", "nodeinvis")
    			.attr("x", x + (handed==bjs.handed.left ? -80 : 0))
    			.attr("width", 80)
    			.attr("height", 18)
    			.attr("y", y);*/
        }

		nodesel.select("circle")
			.attr("class", "node")
			.attr("r", r)
			.attr("cx", x)
			.style("fill", function(d){return bjs.getNodeColor(color, config, d);})
			.attr("cy", y);

		nodesel.select("text")
			.attr("class", "nodelabel")
			.text(function(d) {
				if(longname==true) return d.field.fullname;
				return d.field.name;
			})
			.attr("transform", function(d){return getrotation(d);})
			.attr("x", function(d){return getlabelx(d);})
			.attr("text-anchor", function(d){return gettextanchor(d);})
			.attr("y",function(d){return getlabely(d);});
    }
    
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