var bjs;
(function(bjs) {

    bjs.getNodeColor = getNodeColor;
    bjs.getGroupColor = getGroupColor;
    bjs.areNodesRelated = areNodesRelated;
    bjs.isNodeRelatedToGroup = isNodeRelatedToGroup;
    bjs.shortenString = shortenString;
    bjs.removeItem = removeItem;
    bjs.getLinkColor = getLinkColor;

    function getNodeColor(color, conf, n) {
        if (conf["hilite"] == "critical" && n.field.flags && n.field.flags.indexOf("critical") != -1) return "red";

        if (conf["hilite"] == "untraced" && n.field.sources.length == 0 && n.field.formula == '') return "red"

        if (n.group) {
            return getGroupColor(color, conf, n.group);
        }
        else {
            return getGroupColor(color, conf, n.field.asset);
        }
    }
    
    function getLinkColor(l) {
        if(l.rel.type=="filter") return "#777";
        
        return "blue";
    }

    function getGroupColor(color, conf, g) {

        var s = g.fullname;

        if (!s) s = "unknown";

        if (conf["colorPlan"] == "cat") {
            var cat = s.substring(0, 7);
            return color(cat);
        }

        return color(s);
    }

    function areNodesRelated(a, b) {
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

    function isNodeRelatedToGroup(n, g) {
        if(n.itemtype != "node" || g.itemtype != "group") return false;
        if (n.group.fullname == g.fullname) return true;
        for (var fullname in a.field.ancestors) {
            if (a.field.ancestors[fullname].asset.fullname == b.fullname) return true;
        }
         for (var fullname in a.field.descendants) {
            if (a.field.descendants[fullname].asset.fullname == b.fullname) return true;
        }
        return false;
    }

    function shortenString(str, len) {
        if (str.length <= len) return str;

        var bit = len / 2 - 1;

        return str.substring(0, bit) + "..." + str.substring(str.length - bit, str.length);
    }

    function removeItem(arr, item) {
        arr.splice( $.inArray(item, arr), 1 );
    }
 




})(bjs || (bjs = {}));
