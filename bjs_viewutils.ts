namespace bjs {
    
    export const enum handed {
        left,
        right,
        low,
        row,
        column,
        leftright
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
    
    
    export function drawNodes(nodesg:any, color:any, config:bjs.config, handed:bjs.handed, r:number, invisrect:boolean, longname:boolean):void{
        nodesg.append("rect");
		nodesg.append("circle");
		nodesg.append("text");
		
		var labelx=0,labely=0,labeltheta=0;
		var x=0,y=0;
		var textanchor="start";
		
		switch(handed){
		    case bjs.handed.left:
		        textanchor="end";
		        labelx=-20;
		        break;
		    case bjs.handed.right:
		        labelx=20;
		        break;
		   case bjs.handed.leftright:
		        labelx=20;
		        break;
		   case bjs.handed.low:
		       labely=15;
		       textanchor="middle";
		       break;
		   case bjs.handed.row:
		       break;
		    case bjs.handed.column:
		        break;
		        
		        
		}
		
        if(invisrect){
    		nodesg.select("rect")
    			.attr("class", "nodeinvis")
    			.attr("x", x + (handed==bjs.handed.left ? -80 : 0))
    			.attr("width", 80)
    			.attr("height", 18)
    			.attr("y", y);
        }

		nodesg.select("circle")
			.attr("class", "node")
			.attr("r", r)
			.attr("cx", x)
			.style("fill", function(d){return bjs.getNodeColor(color, config, d);})
			.attr("cy", y);

		nodesg.select("text")
			.attr("class", "nodelabel")
			.text(function(d) {
				if(longname) return d.field.fullname;
				return d.field.name;
			})
			.attr("x", handed==bjs.handed.leftright?function(d){return(d.x<300)?-labelx:labelx}:labelx)
			.attr("text-anchor", handed==bjs.handed.leftright?function(d){return(d.x<300)?"end":"start"}:textanchor)
			.attr("y", labely);
    }
 

}