/// <reference path="bjs_data_json.ts"/>

namespace bjs {


    //
    // Just add node, group and link collections that exactly mirror the underlying world
    //
    export function makeDirect(view:bjs.view, w:bjs.world):bjs.mv {

        var mv = new bjs.mv(w);

        bjs.lg_inf("starting makeDirect");

        for (var fullname in w.fields) {
            var field = w.fields[fullname];

            var n = new bjs.node(view, mv, field);
            mv.nodea.push(n);
            mv.nodes[fullname] = n;
            bjs.lg_inf("node: " + n.fullname);
        }

        for (var fullname in w.assets) {
            var ass = w.assets[fullname];

            var g = new bjs.group(view, ass);
            mv.groupa.push(g);
            mv.groups[fullname] = g;

            for (var i = 0; i < ass.children.length; ++i) {
                if (mv.nodes[ass.children[i].fullname] != null) {
                    g.children.push(mv.nodes[ass.children[i].fullname]);
                    mv.nodes[ass.children[i].fullname].group = g;
                }
            }

            bjs.lg_inf("group: " + g.fullname);
        }

        mv.nodea.sort(firstBy("fullname"));
        mv.groupa.sort(firstBy("fullname"));

        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode = mv.nodes[rel.source.fullname];
            var targetNode = mv.nodes[rel.target.fullname];
            var l = new bjs.link(sourceNode, targetNode, rel);
            mv.links.push(l);
        }

        for (var i = 0; i < w.arela.length; ++i) {
            var arel = w.arela[i];
            var sourceG = mv.groups[arel.source.fullname];
            var targetG = mv.groups[arel.target.fullname];
            var gl = new bjs.glink(sourceG, targetG, arel);
            mv.glinks.push(gl);
        }


        bjs.lg_sum("makeDirect: n " + mv.nodea.length + " links " + mv.links.length + mv.links.length + " glinks " + mv.glinks.length);

        return mv;
    }
    
    // in-place, add points to represent individual dependecies in a matrix
    export function addPts(view:bjs.view, mv:bjs.mv):void{
        
        //we want one visual element per relationship -- where a relationship may be an actual link but may be an ancestor
		//or usource or whatever.
		//each pt has a source and target taken from the l and r sets.
		for (var i = 0; i < mv.world.fielda.length; ++i) {
			var f = mv.world.fielda[i];

			for (var ancestorfullname in f.ancestors) {
			    var pt = new bjs.pt(
			        view,
			        f.fullname + "-" + ancestorfullname,
			        f.ancestors[ancestorfullname].filt,
					f.ancestors[ancestorfullname].ult,
					f.ancestors[ancestorfullname].depth,
					mv.lnodes[ancestorfullname],
					mv.rnodes[f.fullname],
					mv.lnodes[ancestorfullname].group.fullname,
					mv.rnodes[f.fullname].group.fullname
			    );
				
				mv.pts.push(pt);
			}
		}
		
		bjs.lg_sum("addPts: " + mv.pts.length);
    }

    //
    // Add lnodea, rnodea, lgroupa, rgroupa where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
    // and targets will appear in both sets.
    //
    export function makeBipartite(view:bjs.view,w:bjs.world):bjs.mv {

        var mv = new bjs.mv(w);

        bjs.lg_inf("starting makeBipartite");
        

        for (var fullname in w.fields) {
            var field = w.fields[fullname];

            if (field.hasSources()) {
                var n = new bjs.node(view, mv, field);
                mv.rnodea.push(n);
                mv.rnodes[fullname] = n;
                bjs.lg_inf("lnode: " + field.fullname);
            }

            if (field.hasTargets()) {
                var n = new bjs.node(view, mv, field);
                mv.lnodea.push(n);
                mv.lnodes[fullname] = n;
                bjs.lg_inf("rnode: " + field.fullname);
            }
        }

        for (fullname in w.assets) {
            var ass = w.assets[fullname];

            if (ass.hasSources) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.rnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.rnodes[ass.children[i].fullname]);
                        mv.rnodes[ass.children[i].fullname].group = g;
                    }
                    mv.rgroupa.push(g);
                    mv.rgroups[fullname] = g;
                    bjs.lg_inf("rgroup: " + field.fullname);
                }
            }

            if (ass.hasTargets) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.lnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.lnodes[ass.children[i].fullname]);
                        mv.lnodes[ass.children[i].fullname].group = g;
                    }
                    mv.lgroupa.push(g);
                    mv.lgroups[fullname] = g;
                    bjs.lg_inf("lgroup: " + field.fullname);
                }
            }
        }


        mv.rnodea.sort(firstBy("fullname"));
        mv.lnodea.sort(firstBy("fullname"));

        //in this mv, we need exactly one link per rel
        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode = mv.lnodes[rel.source.fullname];
            var targetNode = mv.rnodes[rel.target.fullname];
            var l = new bjs.link(sourceNode, targetNode, rel);
            mv.links.push(l);
        }

        bjs.lg_sum("makeBipartite: l " + mv.lnodea.length + " r " + mv.rnodea.length + " links " + mv.links.length);

        return mv;
    }

    //
    // Add lnodea, rnodea, m1nodea, m2nodea, lgroupa, rgroupa, mgroups where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
    // and targets will appear in both sets. m2nodea and m1nodea are of course identical.
    //
    export function makeTripartite(view:bjs.view,w:bjs.world):bjs.mv {


        var mv = new bjs.mv(w);


        for (var fullname in w.fields) {
            var field = w.fields[fullname];

            if (field.hasSources() && !field.hasTargets()) {
                var n = new bjs.node(view, mv, field);
                mv.rnodea.push(n);
                mv.rnodes[fullname] = n;
            }

            if (field.hasTargets() && !field.hasSources()) {
                var n = new bjs.node(view, mv, field);
                mv.lnodea.push(n);
                mv.lnodes[fullname] = n;
            }

            if (field.hasTargets() && field.hasSources()) {
                var n1 = new bjs.node(view,mv, field);
                var n2 = new bjs.node(view,mv, field);
                mv.m1nodea.push(n1);
                mv.m1nodes[fullname] = n1;
                mv.m2nodea.push(n2);
                mv.m2nodes[fullname] = n2;
            }
        }

        for (fullname in w.assets) {
            var ass = w.assets[fullname];

            if (ass.hasSources()) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.rnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.rnodes[ass.children[i].fullname]);
                        mv.rnodes[ass.children[i].fullname].group = g;
                    }
                }
                mv.rgroupa.push(g);
                mv.rgroups[fullname] = g;

            }

            if (ass.hasTargets()) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.lnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.lnodes[ass.children[i].fullname]);
                        mv.lnodes[ass.children[i].fullname].group = g;
                    }
                }
                mv.lgroupa.push(g);
                mv.lgroups[fullname] = g;

            }


            if (ass.hasTargets() && ass.hasSources()) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.m1nodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.m1nodes[ass.children[i].fullname]);
                        g.children.push(mv.m2nodes[ass.children[i].fullname]);
                        mv.m1nodes[ass.children[i].fullname].group = g;
                        mv.m2nodes[ass.children[i].fullname].group = g;
                    }
                }
                mv.mgroupa.push(g);
                mv.mgroups[fullname] = g;
            }
        }


        mv.rnodea.sort(firstBy("fullname"));
        mv.lnodea.sort(firstBy("fullname"));
        mv.m1nodea.sort(firstBy("fullname"));
        mv.m2nodea.sort(firstBy("fullname"));

        //in this mv, there is exactly one link per rel
        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode:bjs.node, targetNode:bjs.node;

            if (mv.lnodes[rel.source.fullname]) {
                if (mv.rnodes[rel.target.fullname]) {
                    sourceNode = mv.lnodes[rel.source.fullname];
                    targetNode = mv.rnodes[rel.target.fullname];
                }
                else {
                    sourceNode = mv.lnodes[rel.source.fullname];
                    targetNode = mv.m1nodes[rel.target.fullname];
                }
                var l = new bjs.link(sourceNode, targetNode, w.rels[i]);
                mv.links.push(l);
            }
            else {
                if (mv.rnodes[rel.target.fullname]) {
                    sourceNode = mv.m2nodes[rel.source.fullname];
                    targetNode = mv.rnodes[rel.target.fullname];
                }
                else {
                    sourceNode = mv.m1nodes[rel.source.fullname];
                    targetNode = mv.m2nodes[rel.target.fullname];
                }
                var l = new bjs.link(sourceNode, targetNode, rel);
                mv.links.push(l);
            }

        }

        return mv;
    }


    /*
      Creates a cola-compatible graph in which links refer to their nodes using index numbers rather than something sensible.
      Nodes are given index numbers.
      A set of group data suitable for cola is also added to dat.
      */
    export function makeColaGraph(view:bjs.view, w:bjs.world):bjs.mv {

        var mv = new bjs.mv(w);

        for (var i = 0; i < w.fielda.length; ++i) {
            var n = new bjs.node(view, mv, w.fielda[i]);
            n.cola_index = i;
            mv.nodea.push(n);
            mv.nodes[n.fullname] = n;
        }

        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var src = mv.nodes[rel.source.fullname];
            var tgt = mv.nodes[rel.target.fullname];
            
            var colalink = {
                id: src.fullname + tgt.fullname+i,
                realsource: src,
                realtarget: tgt,
                rel: rel,
                source:src.cola_index,
                target:tgt.cola_index
            };
            
            mv.colalinks.push(colalink);
            
            /*
            var link = new bjs.link(src, tgt, rel);

            link.id = link.source.fullname + link.target.fullname + i;
            link.realsource = link.source;
            link.realtarget = link.target;
            link.source = link.source.cola_index; // replace references with numbers to please cola
            link.target = link.target.cola_index;

            mv.links.push(link);
            */
            
        }


        for (var fullname in w.assets) {
            var ass = w.assets[fullname];

            var g = new bjs.group(view, ass);
            g.leaves = [];

            for (var j = 0; j < ass.children.length; ++j) {
                g.leaves.push(mv.nodes[ass.children[j].fullname].cola_index);
            }

            if (g.leaves.length > 0) {
                mv.groupa.push(g);
                mv.groups[g.fullname] = g;
            }
        }
        

        return mv;
    }



    export function makeTree(view:bjs.view, w:bjs.world):bjs.mv {

        var mv = new bjs.mv(w);

        mv.treeroots = [];

        for (var i = 0; i < w.fielda.length; ++i) {

            if (w.fielda[i].directlyrelevant) {
                var f = w.fielda[i];
                var root = new bjs.node(view, mv, f);
                root.children = [];
                root.nameintree = root.fullname;

                recursiveTreeBuild(view, mv, root, f);

                mv.treeroots.push(root);
            }

        }

        //add a synthetic root and gather all the treeroots in the dataset under it
        var syntharoot = new bjs.node(view, mv, null);
        syntharoot.children = mv.treeroots;
        syntharoot.fullname = "Synthetic root node";
        mv.syntharoot = syntharoot;

        return mv;
    }


    // internal function used in makeTree.
    // b = node in the tree we are building.  n = field under consideration.
    function recursiveTreeBuild(view:bjs.view, mv:bjs.mv, b:bjs.node, n:bjs.field):void {

        b.children = [];

        for (var i = 0; i < n.sources.length; ++i) {
            var src = n.sources[i];
            var newtreenode = new bjs.node(view,mv, src);

            newtreenode.nameintree = b.nameintree + newtreenode.fullname;

            b.children.push(newtreenode);
            newtreenode.parent = b;

            recursiveTreeBuild(view, mv, newtreenode, src);

        }

    }
}
