/// <reference path="bjs_types.ts"/>
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
    export function addPts(view:bjs.view, mv:bjs.mv, c:bjs.config):void{
        
        //we want one visual element per relationship -- where a relationship may be an actual link but may be an ancestor
		//or usource or whatever.
		//each pt has a source and target taken from the l and r sets.
		for (var i = 0; i < mv.world.fielda.length; ++i) {
			var f = mv.world.fielda[i];

			for (var ancestorfullname in f.ancestors) {
                var inf = f.ancestors[ancestorfullname];

                if(c.infFlag == bjs.infFlag.all ||
                    (c.infFlag == bjs.infFlag.immediate && inf.depth==1) ||
                    (c.infFlag == bjs.infFlag.ultimate && inf.ult==true)) {

    			    var pt = new bjs.pt(
    			        view,
    			        f.fullname + "-" + ancestorfullname,
    			        inf.filt,
    					inf.ult,
    					inf.depth,
    					mv.lnodes[ancestorfullname],
    					mv.rnodes[f.fullname],
    					mv.lnodes[ancestorfullname].group.fullname,
    					mv.rnodes[f.fullname].group.fullname
    			    );
				
				    mv.pts.push(pt);
                }
			}
		}
		
		bjs.lg_sum("addPts: " + mv.pts.length);
    }

    //
    // prepare a 4 column alluvial-like plot.  col 1 is focus, col 2 and 3 are x and y axis, and col 4 is same as for bipartite
    // this view does not use rels.
    //
    export function makeStats(view:bjs.view, w:bjs.world):bjs.mv{
        var mv = new bjs.mv(w);

        bjs.lg_inf("starting makeStats");

        //4 sets of nodes, every node appears in each set.
        for(var i=0; i<w.fielda.length; ++i){
            var f = w.fielda[i];

            var n;
            n = new bjs.node(view, mv, f);
            mv.rnodea.push(n);
            mv.rnodes[n.fullname] = n;

            n = new bjs.node(view, mv, f);
            mv.lnodea.push(n);
            mv.lnodes[n.fullname] = n;

            n = new bjs.node(view, mv, f);
            mv.m1nodea.push(n);
            mv.m1nodes[n.fullname] = n;

            n = new bjs.node(view, mv, f);
            mv.m2nodea.push(n);
            mv.m2nodes[n.fullname] = n;
        }

        for (var fullname in w.assets) {
            var ass = w.assets[fullname];

            var g = new bjs.group(view, ass);
            mv.groupa.push(g);
            mv.groups[fullname] = g;

            //all nodes know what group they belong to, but groups only have rnodes as children... bit of a minefield that.

            for (var i = 0; i < ass.children.length; ++i) {
                if (mv.lnodes[ass.children[i].fullname] != null) {
                    mv.lnodes[ass.children[i].fullname].group = g;
                }
                if (mv.rnodes[ass.children[i].fullname] != null) {
                    g.children.push(mv.rnodes[ass.children[i].fullname]);
                    mv.rnodes[ass.children[i].fullname].group = g;
                }
                if (mv.m1nodes[ass.children[i].fullname] != null) {
                    mv.m1nodes[ass.children[i].fullname].group = g;
                }
                if (mv.m2nodes[ass.children[i].fullname] != null) {
                    mv.m2nodes[ass.children[i].fullname].group = g;
                }
            }

            bjs.lg_inf("group: " + g.fullname);
        }

        //now, we add synthetic links between the nodes
        for(var i=0;i<mv.lnodea.length;++i){
            var fn = mv.lnodea[i].fullname;

            mv.links.push(new bjs.link(mv.lnodes[fn], mv.m1nodes[fn], null));
            mv.links.push(new bjs.link(mv.m1nodes[fn], mv.m2nodes[fn], null));
            mv.links.push(new bjs.link(mv.m2nodes[fn], mv.rnodes[fn], null));
        }

        return mv;

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

            if (ass.hasSources() && ass.children.length > 0) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.rnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.rnodes[ass.children[i].fullname]);
                        mv.rnodes[ass.children[i].fullname].group = g;
                    }
                }
                mv.rgroupa.push(g);
                mv.rgroups[fullname] = g;
                bjs.lg_inf("rgroup: " + field.fullname);
            
            }

            if (ass.hasTargets() && ass.children.length > 0) {
                var g = new bjs.group(view, ass);
                for (var i = 0; i < ass.children.length; ++i) {
                    if (mv.lnodes[ass.children[i].fullname] != null) {
                        g.children.push(mv.lnodes[ass.children[i].fullname]);
                        mv.lnodes[ass.children[i].fullname].group = g;
                    }
                }
                mv.lgroupa.push(g);
                mv.lgroups[fullname] = g;
                bjs.lg_inf("lgroup: " + field.fullname);
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
    export function makeTripartite(view:bjs.view,w:bjs.world, fullcenter:boolean):bjs.mv {


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

            if ((field.hasTargets() && field.hasSources()) || fullcenter ) {
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


            if ((ass.hasTargets() && ass.hasSources()) || fullcenter) {
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

        //if !fullcenter, there is exactly 1 link per rel
        //but if fullcenter, rels from ult src to ult tgt become 2 links
        
        for (var i = 0; i < w.rels.length; ++i) {
            var rel = w.rels[i];
            var sourceNode:bjs.node, targetNode:bjs.node;

            if (mv.lnodes[rel.source.fullname]) {
                if (mv.rnodes[rel.target.fullname]) {
                    if(!fullcenter){
                        sourceNode = mv.lnodes[rel.source.fullname];
                        targetNode = mv.rnodes[rel.target.fullname];
                    }else{
                        sourceNode = mv.lnodes[rel.source.fullname];
                        targetNode = mv.m1nodes[rel.target.fullname];
                        var xtra = new bjs.link(sourceNode, targetNode, w.rels[i]);
                        mv.links.push(xtra);
                        sourceNode = mv.m2nodes[rel.source.fullname];
                        targetNode = mv.rnodes[rel.target.fullname];
                    }
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
    export function makeColaGraph(view:bjs.view, w:bjs.world, c:bjs.config):bjs.mv {

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
        }


        for (var fullname in w.assets) {
            var ass = w.assets[fullname];

            var g = new bjs.group(view, ass);
            g.leaves = [];

            for (var j = 0; j < ass.children.length; ++j) {
                var n:bjs.node = mv.nodes[ass.children[j].fullname];
                g.leaves.push(n.cola_index);
                g.children.push(n);
                n.group = g;
            }

            if (g.leaves.length > 0) {
                mv.groupa.push(g);
                mv.groups[g.fullname] = g;
                g.cola_index = mv.groupa.length-1;
            }
        }

        //add higher level groupings
        if(c.blockplan != bjs.blockplan.none){
            var found = {};
            for (var fullname in w.assets) {
                var ass = w.assets[fullname];
                var g:bjs.group;
                var block = bjs.getBlock(ass, c.blockplan);

                if(found[block]){
                    g = found[block];
                }else{
                    g = new bjs.group(view, null);

                    g.fullname = "Block: " + block;
                    g.name = block;
                    found[block] = g;
                    mv.groupa.push(g);
                    mv.groups[g.fullname]=g;
                    g.cola_index = mv.groupa.length-1;
                }

                g.groups.push(mv.groups[ass.fullname].cola_index);
            }
        }
        

        return mv;
    }


    /*
      Creates a cola-compatible graph in which nodes represent blocks -- i.e. asset groupings.
      */
    export function makeColaBlockGraph(view:bjs.view, w:bjs.world, c:bjs.config):bjs.mv {

        var mv = new bjs.mv(w);

        var blockplan = c.blockplan;
        if(blockplan == bjs.blockplan.none){
            blockplan = bjs.blockplan.cat;
        }

        //find blocks and create a node for each block
        var found = {};
        for (var fullname in w.assets) {
            var ass = w.assets[fullname];
            var b:bjs.block;
            var block = bjs.getBlock(ass, blockplan);

            if(found[block]){
                b = found[block];
                b.asset_count++;
                b.field_count += ass.children.length;
            }else{
                b = new bjs.block(view, this, block, block, blockplan);
                b.asset_count = 1;
                b.field_count = ass.children.length;
                found[block] = b;
                mv.blocks[block]=b;
                mv.blocka.push(b);
                b.cola_index = mv.blocka.length-1;
            }
        }

        //find links between blocks, much as one might for groups
        found = {};
        for(var i=0;i<w.arela.length;++i){
            var ar = w.arela[i];
            var lblock = bjs.getBlock(ar.source, blockplan);
            var rblock = bjs.getBlock(ar.target, blockplan);

            if(lblock == rblock)
                continue;
            
            var key = lblock + " - " + rblock;
            var lidx = mv.blocks[lblock].cola_index;
            var ridx = mv.blocks[rblock].cola_index;

            if(found[key]){
                found[key].count += ar.count;
            }else{
                var colalink = {
                    id: key+i,
                    source: lidx,
                    target: ridx,
                    realsource: mv.blocks[lblock],
                    realtarget: mv.blocks[rblock],
                    count: ar.count
                }
                found[key] = colalink;
                mv.colalinks.push(colalink);
            }

            mv.blocks[rblock].sources[lblock] = mv.blocks[lblock];
            mv.blocks[lblock].targets[rblock] = mv.blocks[rblock];
        }

        for(var i=0;i<mv.blocka.length;++i){
            var b = mv.blocka[i];
            for(var bn in b.sources){
                b.sourcea.push(mv.blocks[bn]);
            }
            for(var bn in b.targets){
                b.targeta.push(mv.blocks[bn]);
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
