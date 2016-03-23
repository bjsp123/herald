/// <reference path="bjs_types.ts"/>

namespace bjs {
   
    
    export class rect{
        constructor(public top:number, public left:number, public bottom:number, public right:number){
        }
        public height():number{return this.bottom-this.top;}
        public width():number{return this.right-this.left;}
        public centerx():number{return (this.right+this.left)/2;}
        public expand(r:number):rect{return new rect(this.top-r, this.left-r,this.bottom+r,this.right+r);}
    }


    export function getNodeColor(config:bjs.config, focus:bjs.filter, n:bjs.node):string {
    	if(bjs_data_json.isMatch(n.field, focus)){
    		return "red";
    	}
    	
    	switch(config.showDetail){
			case bjs.showDetail.timing:
				return config.detailColor(n.field.asset.effnotbefore / d3.max(n.mv.world.fielda, function(d) { return d.asset.effnotbefore;}));
			case bjs.showDetail.importance:
				return config.detailColor(n.field.effimportance / d3.max(n.mv.world.fielda, function(d) { return d.effimportance; }));
			case bjs.showDetail.risk:
				return config.detailColor(n.field.effrisk / d3.max(n.mv.world.fielda, function(d) { return d.effrisk; }));
			case bjs.showDetail.quality:
				return config.detailColor((n.field.effquality-1) / d3.max(n.mv.world.fielda, function(d) { return (d.effquality-1); }));
			case bjs.showDetail.nolineage:
				return config.detailColor(n.field.effnolineage?1:0);
    	}

        if (n.group) {
            return getColorFromName(config, n.group.fullname);
        }
        else {
            return getColorFromName(config, n.field.asset.fullname);
        }
    }
    
    export function getLinkColor(config:bjs.config, focus:bjs.filter, l:bjs.link):string {
    	
    	if(bjs_data_json.isMatch(l.source.field, focus)){
    			return "red";
    	}
    	
    	switch(config.linkColorplan){
    		case bjs.linkColorplan.bytype:
    			return(l.rel.type=="filter") ? "#575" : "blue";
    		case bjs.linkColorplan.bynode:
    			return bjs.getNodeColor(config, focus, l.source);
    		default:
    			return "gray";
    	}
    }

    export function getPtColor(config:bjs.config, focus:bjs.filter, pt:bjs.pt):string{
    	if(bjs_data_json.isMatch(pt.source.field, focus)){
    		return "red";
    	}

    	switch(config.linkColorplan){
    		case bjs.linkColorplan.bytype:
    			return(pt.isFilter) ? "#575" : "blue";
    		case bjs.linkColorplan.bynode:
    			return bjs.getNodeColor(config, focus, pt.source);
    		default:
    			return "gray";
    	}


    }
    
    export function getLinkPath(d:bjs.link, offs:number, random:boolean, bundle:boolean){
    	
    	var randy = random?Math.random()*3:0;

    	if(offs > (d.target.x - d.source.x)/3){
    		offs = (d.target.x - d.source.x)/3;
    	}
    	
    	if(!bundle){
    		return "M " + d.source.x + " " + (d.source.y + randy) +
				"C " + (d.source.x + offs) + " " + d.source.y +
				" " + (d.target.x - offs) + " " + d.target.y +
				" " + d.target.x + " " + (d.target.y + randy);
    	}
    	
    	
		return "M " + d.source.x + " " + (d.source.y + randy) +
			"C " + (d.source.x + offs) + " " + (d.source.group.y + d.source.group.height/2) +
			" " + (d.target.x - offs) + " " + (d.target.group.y + d.target.group.height/2) +
			" " + d.target.x + " " + (d.target.y + randy);
    }

    export function getColorFromName(config:bjs.config, fullname:string):string {

        if (!fullname) fullname = "unknown";

        switch(config.nodeColorplan){
			case bjs.colorplan.flat:
				return "gray";
			case bjs.colorplan.cat:
				return config.color(fullname.substring(0, 7));
			case bjs.colorplan.asset:
				return config.color(fullname);
        }

        return config.color(fullname);
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
		if (str == null) return "";
        if (str.length <= len) return str;

        var bit = len / 2 - 1;

        return str.substring(0, bit) + "..." + str.substring(str.length - bit, str.length);
    }

    export function breakPath(str:string):string{
        return str.replace("/", "/ ").replace("\\", "\\ ");
    }
    
    
    export function drawGroupBox(groupsel:any, groupsenter:any, config:bjs.config, corners:number){
    	
    	groupsenter.append("rect");
		groupsenter.append("text");

		groupsel.select("rect")
			.attr("x",0)
			.attr("width", function(d) {
				return d.width;
			})
			.style("fill", function(d) {
				if(d.groups && d.groups.length>0) return "none";
				return bjs.getColorFromName(config, d.fullname);
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
			.style("fill", function(d) {
				return bjs.getColorFromName(config, d.fullname);
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d) {
				return d.width / 2;
			})
			.attr("y", function(d, i) {
				return d.height + 15;
			});
    	
    }
    
    export function drawGroupBar(groupsel:any, groupsenter:any, config:bjs.config):void{
    	
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
			        return d.width/2;
			   case bjs.handed.row:
			   		return d.width/2-10;
			   case bjs.handed.column:
			   		return -10;
			   	case bjs.handed.leftright:
			   		return d.x<400?-20:20+d.width;
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
			       return d.height+12;
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
			   		return d.x<400?"end":"start";
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
				return bjs.getColorFromName(config, d.fullname);
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
    
    
    export function drawNodes(nodesel:any, nodesenter:any, config:bjs.config, focus:bjs.filter, r:number, invisrect:boolean, longname:boolean):void{
		nodesenter.append("circle").attr("class", "nodecenter");
		//nodesenter.append("circle").attr("class", "nodepie");
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
			   case bjs.handed.low:
			        return 0;
			   case bjs.handed.row:
			   		return 10;
			   case bjs.handed.column:
			   		return -15;
			   	case bjs.handed.leftright:
			   		return d.x<400?-20:20;
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
			   	case bjs.handed.column:
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
			   		return d.x<400?"end":"start";
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

		nodesel.select("circle")
			.attr("class", "nodecircle node")
			.attr("r", r)
			.attr("cx", x)
			.style("fill", function(d){return bjs.getNodeColor(config, focus, d);})
			.style("stroke-dasharray", function(d){return d.isNFLogical()?"3,3":"";})
			.attr("cy", y);

		nodesel.select("text")
			.attr("class", "nodelabel node")
			.text(function(d) {
				if(d.handed == bjs.handed.none) return "";
				if(d.isLogical()) return d.fullname;
				if(longname==true) return d.field.fullname;
				return d.field.name;
			})
			.attr("transform", function(d){return getrotation(d);})
			.attr("x", function(d){return getlabelx(d);})
			.attr("text-anchor", function(d){return gettextanchor(d);})
			.attr("y",function(d){return getlabely(d);});
    }
    
	
}
