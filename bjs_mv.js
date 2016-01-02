//model view

var bjs;
(function(bjs) {

    bjs.makeBipartite = makeBipartite;
    bjs.makeTripartite = makeTripartite;
    bjs.makeColaGraph = makeColaGraph;


    //
    // Add lnodea, rnodea, lgroupa, rgroupa where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
    // and targets will appear in both sets.
    //
    function makeBipartite(w) {

        var mv = new bjs.mv(w);
        
        bjs.lg_inf("starting makeBipartite");

        var lnodea = [];
        var rnodea = [];
        var lgroupa = [];
        var rgroupa = [];
        var lgroups = {};
        var rgroups = {};
        var lnodes = {};
        var rnodes = {};
        var links = [];

        for (fullname in w.fields) {
            var field = w.fields[fullname];

            if (field.hasSources) {
                var n = new bjs.node(field);
                rnodea.push(n);
                rnodes[fullname] = n;
                bjs.lg_inf("lnode: " + field.fullname);
            }

            if (field.hasTargets) {
                var n = new bjs.node(field);
                lnodea.push(n);
                lnodes[fullname] = n;
                bjs.lg_inf("rnode: " + field.fullname);
            }
        }

        for (fullname in w.assets) {
            var ass = w.assets[fullname];

            if (ass.hasSources) {
                var g = new bjs.group(ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (rnodes[ass.children[i].fullname] != null) {
                        g.children.push(rnodes[ass.children[i].fullname]);
                        rnodes[ass.children[i].fullname].group = g;
                    }
                    rgroupa.push(g);
                    rgroups[fullname] = g;
                    bjs.lg_inf("rgroup: " + field.fullname);
                }
            }

            if (ass.hasTargets) {
                var g = new bjs.group(ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (lnodes[ass.children[i].fullname] != null) {
                        g.children.push(lnodes[ass.children[i].fullname]);
                        lnodes[ass.children[i].fullname].group = g;
                    }
                    lgroupa.push(g);
                    lgroups[fullname] = g;
                    bjs.lg_inf("lgroup: " + field.fullname);
                }
            }
        }


        rnodea.sort(firstBy("fullname"));
        lnodea.sort(firstBy("fullname"));

        mv.lnodea = lnodea;
        mv.rnodea = rnodea;
        mv.lnodes = lnodes;
        mv.rnodes = rnodes;
        mv.lgroupa = lgroupa;
        mv.rgroupa = rgroupa;
        mv.lgroups = lgroups;
        mv.rgroups = rgroups;
        mv.lnodes = lnodes;
        mv.rnodes = rnodes;

        //in this mv, we need exactly one link per rel
        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode = lnodes[rel.source.fullname];
            var targetNode = rnodes[rel.target.fullname];
            var l = new bjs.link(sourceNode, targetNode, rel);
            links.push(l);
        }

        mv.links = links;
        
        bjs.lg_sum("makeBipartite: l " + mv.lnodea.length + " r " + mv.rnodea.length + " links " + mv.links.length);

        return mv;
    }

    //
    // Add lnodea, rnodea, m1nodea, m2nodea, lgroupa, rgroupa, mgroups where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
    // and targets will appear in both sets. m2nodea and m1nodea are of course identical.
    //
    function makeTripartite(w) {


        var mv = new bjs.mv(w);

        var lnodea = [];
        var rnodea = [];
        var m1nodea = [];
        var m2nodea = [];
        var lgroupa = [];
        var rgroupa = [];
        var mgroupa = [];
        var mgroups = {};
        var lgroups = {};
        var rgroups = {};
        var lnodes = {};
        var rnodes = {};
        var m1nodes = {};
        var m2nodes = {};
        var links = [];

        for (fullname in w.fields) {
            var field = w.fields[fullname];

            if (field.hasSources && !field.hasTargets) {
                var n = new bjs.node(field);
                rnodea.push(n);
                rnodes[fullname] = n;
            }

            if (field.hasTargets && !field.hasSources) {
                var n = new bjs.node(field);
                lnodea.push(n);
                lnodes[fullname] = n;
            }

            if (field.hasTargets && field.hasSources) {
                var n1 = new bjs.node(field);
                var n2 = new bjs.node(field);
                m1nodea.push(n1);
                m1nodes[fullname] = n1;
                m2nodea.push(n2);
                m2nodes[fullname] = n2;
            }
        }
        
        for (fullname in w.assets) {
            var ass = w.assets[fullname];

            if (ass.hasSources) {
                var g = new bjs.group(ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (rnodes[ass.children[i].fullname] != null) {
                        g.children.push(rnodes[ass.children[i].fullname]);
                        rnodes[ass.children[i].fullname].group = g;
                    }
                }
                rgroupa.push(g);
                rgroups[fullname] = g;
                
            }

            if (ass.hasTargets) {
                var g = new bjs.group(ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (lnodes[ass.children[i].fullname] != null) {
                        g.children.push(lnodes[ass.children[i].fullname]);
                        lnodes[ass.children[i].fullname].group = g;
                    }
                }
                lgroupa.push(g);
                lgroups[fullname] = g;
                
            }


            if (ass.hasTargets && ass.hasSources) {
                var g = new bjs.group(ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (m1nodes[ass.children[i].fullname] != null) {
                        g.children.push(m1nodes[ass.children[i].fullname]);
                        g.children.push(m2nodes[ass.children[i].fullname]);
                        m1nodes[ass.children[i].fullname].group = g;
                        m2nodes[ass.children[i].fullname].group = g;
                    }
                }
                mgroupa.push(g);
                mgroups[fullname] = g;
            }
        }


        rnodea.sort(firstBy("fullname"));
        lnodea.sort(firstBy("fullname"));
        m1nodea.sort(firstBy("fullname"));
        m2nodea.sort(firstBy("fullname"));

        mv.lnodea = lnodea;
        mv.rnodea = rnodea;
        mv.m1nodea = m1nodea;
        mv.m2nodea = m2nodea;
        mv.lgroupa = lgroupa;
        mv.rgroupa = rgroupa;
        mv.mgroupa = mgroupa;

        //in this mv, there is exactly one link per rel
        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode, targetNode;

            if (lnodes[rel.source.fullname]) {
                if (rnodes[rel.target.fullname]) {
                    sourceNode = lnodes[rel.source.fullname];
                    targetNode = rnodes[rel.target.fullname];
                }
                else {
                    sourceNode = lnodes[rel.source.fullname];
                    targetNode = m1nodes[rel.target.fullname];
                }
                var l = new bjs.link(sourceNode, targetNode, w.rels[i]);
                links.push(l);
            }
            else {
                if (rnodes[rel.target.fullname]) {
                    sourceNode = m2nodes[rel.source.fullname];
                    targetNode = rnodes[rel.target.fullname];
                }
                else {
                    sourceNode = m1nodes[rel.source.fullname];
                    targetNode = m2nodes[rel.target.fullname];
                }
                var l = new bjs.link(sourceNode, targetNode, rel);
                links.push(l);
            }

        }

        mv.links = links;

        return mv;
    }


/*
  Creates a cola-compatible graph in which links refer to their nodes using index numbers rather than something sensible.
  Nodes are given index numbers.
  A set of group data suitable for cola is also added to dat.
  */
  function makeColaGraph(w){

    var mv = new bjs.mv(w);

    for(var i=0;i<w.fielda.length; ++i){
        var n = new bjs.node(w.fielda[i]);
        n.cola_index = i;
        mv.nodea.push(n);
        mv.nodes[n.fullname] = n;
    }

    for(var i=0; i< w.rels.length; ++i){
        var rel = w.rels[i];
        var src = mv.nodes[rel.source.fullname];
        var tgt = mv.nodes[rel.target.fullname];
        var link = new bjs.link(src, tgt, rel);

        link.id = link.source.fullname+link.target.fullname+i;        
        link.realsource = link.source;
        link.realtarget = link.target;
        link.source = link.source.cola_index; // replace references with numbers to please cola
        link.target = link.target.cola_index;

        mv.links.push(link);
    }


    for (fullname in w.assets){
      var ass = w.assets[fullname];  

      var g = new bjs.group(ass);
      g.id = g.fullname; //it's easier in cola if it's called 'id'.
      g.leaves = [];

      for(var j =0;j<ass.children.length;++j){
          g.leaves.push(mv.nodes[ass.children[j].fullname].cola_index);
      }

      if(g.leaves.length > 0){
          mv.groupa.push(g);
          mv.groups[g.fullname] = g;
      }
  }

  return mv;
}



})(bjs || (bjs = {}));
