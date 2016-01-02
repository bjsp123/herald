var bjs;
(function(bjs) {

    bjs.getNodeColor = getNodeColor;
    bjs.getGroupColor = getGroupColor;
    bjs.areNodesRelated = areNodesRelated;
    bjs.isNodeRelatedToGroup = isNodeRelatedToGroup;

    function getNodeColor(color, conf, n) {
        if (conf["hilite"] == "critical" && n.field.critical == "Critical") return "red";

        if (conf["hilite"] == "untraced" && n.field.ancestors.length == 0 && n.field.formula == '') return "red"

            if(n.group){
                return getGroupColor(color, conf, n.group);
            }else{
                return getGroupColor(color, conf, n.field.asset);
            }
    }

    function getGroupColor(color, conf, g) {

        var s = g.fullname;

        if(!s) s = "unknown";

        if (conf["colorPlan"] == "cat") {
            var cat = s.substring(0, 7);
            return color(cat);
        }

        return color(s);
    }

    function areNodesRelated(a, b) {
        if (a.fullname == b.fullname) return true;
        for (var i = 0; i < a.field.peers.length; ++i) {
            if (a.field.peers[i].fullname == b.fullname) return true;
        }
        return false;
    }

    function isNodeRelatedToGroup(n, g) {
        if (n.group.fullname == g.fullname) return true;
        for (var i = 0; i < n.field.peers.length; ++i) {
            if (n.field.peers[i].asset.fullname == g.fullname) return true; //assumes asset name is group name, may not always be true
        }
        return false;
    }




})(bjs || (bjs = {}));
