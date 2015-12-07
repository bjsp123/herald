/*
This file contains methods to read in JSON and build an enriched scene graph.  Ideally, visualizations should use
this output as much as possible and have as little of their own back-end logic as possible.

Output contains 5 collections:

nodes is an array of nodes representing data fields.  these are annotated with targets, sources etc.
errors is an errors collection
links is an array of guess what
groups is an array of groups that contain nodes
glinks is an array of links between groups
*/


//json is an object read from excel.  it has 2 collections, 'raw' and 'sources'.
//
// this method builds nodes, nodea, links and pkgs from the input.
//
function prepare(json, fieldFilterFunc) {

    var nodes = {};
    var nodea = [];
    var links = [];
    var pkgs = {};
    var terms = {};
    var errors = [];


    var rawpkg = json.sources;

    for(var i=0; i<rawpkg.length;i++){

      var pkg = {
        fullname: rawpkg[i].fullname,
        name: rawpkg[i].fullname.split(".")[rawpkg[i].fullname.split(".").length-1],
        location: rawpkg[i].location,
        type: rawpkg[i].type,
        owner: rawpkg[i].owner,
        desc: rawpkg[i].desc,
        calc: rawpkg[i].calc,
        itemtype: "group",
        links: [],
        sources: [],
        targets: [],
        children: []
      }

      pkgs[pkg.fullname] = pkg;
    }

    var terms = json.terms;

    for(var i=0; i<terms.length;i++){

      var term = {
        code: terms[i].code,
        desc: terms[i].desc,
        name: terms[i].name,
        critical: terms[i].critical
      }

      terms[term.code] = term;
    }

    var raw = json.raw;

    for(var i=0; i<raw.length;i++){

      if(raw[i].fullname == null || raw[i].fullname.length < 3){
        errors.push("Skipping blank node " + raw[i].fullname);
        continue;
      }

      try{
        var node = {
          itemtype:"node",
          fullname:raw[i].fullname,
          desc:raw[i].desc,
          critical:raw[i].critical,
          name:raw[i].fullname.split(":")[1],
          pkgname:raw[i].fullname.split(":")[0],
          termname:raw[i].conceptname,
          formula:raw[i].formula,
          links:[],
          peers:[],
          sources:[],
          targets:[],
          ancestors:{},
          descendants:{},
          ldepth:0,
          rdepth:0,
          usources:{},
          utargets:{},
          pkg:pkgs[raw[i].fullname.split(":")[0]],
          term:terms[raw[i].conceptname]};

        if(fieldFilterFunc && fieldFilterFunc(node) == false)
          continue;

        if(node.pkg == null){
          errors.push("Package not found for node " + raw[i].fullname);
          continue;
        }

        if(node.term != null && node.term.critical != ""){
            node.critical = node.term.critical;
        }

        node.pkg.children.push(node);
        nodes[node.fullname] = node;
        nodea.push(node);
      }catch(err) {
        errors.push("Error reading node " + raw[i].fullname + " -- " + err);
        continue;
      }
   
   }

   for(var i=0; i<raw.length;i++){

      if(nodes[raw[i].fullname] == null)
        continue;

      for(var j=0;j < raw[i].usesvalue.length;j++){

        var link = {
          itemtype:"link",
          source: nodes[raw[i].usesvalue[j]],
          target: nodes[raw[i].fullname],
          type: "measure"};

        if(link.source == null || link.target == null) {
          errors.push("Error reading measure link " + raw[i].fullname + " -- can't find " + raw[i].usesvalue[j]);
          continue;
        }

        links.push(link);
      }

      for(var j=0;j < raw[i].usesfilter.length;j++){

        var link = {
          itemtype:"link",
          source: nodes[raw[i].usesfilter[j]],
          target: nodes[raw[i].fullname],
          type: "filter"};

        if(link.source == null || link.target == null) {
          errors.push("Error reading filter link " + raw[i].fullname + " -- can't find " + raw[i].usesfilter[j]);
          continue;
        }

        links.push(link);
      }

    }

    nodea.sort(firstBy("fullname"));

    var relevantpkgs = {};

    for(fullname in pkgs) {
      if(pkgs[fullname].children.length > 0)
        relevantpkgs[fullname] = pkgs[fullname];
    }


    var dat = {};

    dat.nodes = nodes;
    dat.nodea = nodea;
    dat.links = links;
    dat.pkgs = relevantpkgs;
    dat.errors = errors;

    return dat;
}


//
// annotate nodes with sources, targets, and links.
// annotate packages with package dependencies.
//
function process(dat) {

  var glinks = {};
  var glinka = [];

  for(var i=0; i < dat.links.length; ++i){
    var srcnode = dat.links[i].source;
    var tgtnode = dat.links[i].target;

    srcnode.links.push(dat.links[i]);
    tgtnode.links.push(dat.links[i]);
    srcnode.peers.push(tgtnode);
    tgtnode.peers.push(srcnode);
    srcnode.targets.push(tgtnode);
    tgtnode.sources.push(srcnode);
    srcnode.hasTargets = true;
    tgtnode.hasSources = true;


    var glink_key = srcnode.pkg.fullname+"-"+tgtnode.pkg.fullname;

    var glink = glinks[glink_key];

    if(glink == null){
      glink = {
        glink_key: glink_key,
        source: srcnode.pkg,
        target: tgtnode.pkg,
        itemtype: "glink",
        count: 0
      };

      glink.source.links.push(glink);
      glink.target.links.push(glink);
      glink.source.targets.push(glink.target);
      glink.target.sources.push(glink.source);
      glink.source.hasTargets = true;
      glink.target.hasSources = true;

      glinks[glink_key] = glink;
    }

    glink.count += 1;

  }

  for(glink_key in glinks) {
    var glink = glinks[glink_key];
    glinka.push(glink);
  }

  dat.glinks = glinks;
  dat.glinka = glinka;

  return dat;
}


//
// Fill in ancestor and descendent detail for nodes.   it's tempting to optimize this but I will resist.
//
function resolveRelatives(dat){

  for(var i = 0; i < dat.nodea.length; ++i) {

    var n = dat.nodea[i];

    recursiveRelatives(dat, n, n, 0, false, true);
    recursiveRelatives(dat, n, n, 0, false, false);

  }

  return dat;

}

//
// Add lnodes, rnodes, lgroups, rgroups where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
// and targets will appear in both sets.
//
function splitSourceTarget(dat){

  var lnodes = [];
  var rnodes = [];
  var lgroups = [];
  var rgroups = [];
  var lgroupd = {};
  var rgroupd = {};
  var lnoded = {};
  var rnoded = {};

    for(fullname in dat.nodes){
      var field = dat.nodes[fullname];
      field.marker="original";

      if(field.hasSources){
        var newfield = clone(field);
        newfield.marker="rcopy";
        rnodes.push(newfield);
        rnoded[fullname] = newfield;
      }

      if(field.hasTargets){
        var newfield = clone(field);
        newfield.marker="lcopy";
        lnodes.push(newfield);
        lnoded[fullname] = newfield;
      }
    }

    for (fullname in dat.pkgs){
      var pkg = dat.pkgs[fullname];
      pkg.marker="original";

      if(pkg.hasSources){
        var newpkg = clone(pkg);
        newpkg.marker="rcopy";
        newpkg.children=[];
        for (var i=0; i < pkg.children.length; ++i){
          if(rnoded[pkg.children[i].fullname] != null) newpkg.children.push(rnoded[pkg.children[i].fullname]);
        }
        rgroups.push(newpkg);
        rgroupd[fullname] = newpkg;
      }

      if(pkg.hasTargets){
        var newpkg = clone(pkg);
        newpkg.marker="lcopy";
        newpkg.children=[];
        for (var i=0; i < pkg.children.length; ++i){
          if(lnoded[pkg.children[i].fullname] != null) newpkg.children.push(lnoded[pkg.children[i].fullname]);
        }
        lgroups.push(newpkg);
        lgroupd[fullname] = newpkg;
      }
    }

    for(var i=0; i < rnodes.length; ++i){
      var node = rnodes[i];
      node.pkg = rgroupd[node.pkg.fullname];
    }

    for(var i=0; i < lnodes.length; ++i){
      var node = lnodes[i];
      node.pkg = lgroupd[node.pkg.fullname];
    }

    rnodes.sort(firstBy("pkgname").thenBy("fullname"));
    lnodes.sort(firstBy("pkgname").thenBy("fullname"));

    dat.lnodes = lnodes;
    dat.rnodes = rnodes;
    dat.lgroups = lgroups;
    dat.rgroups = rgroups;
    dat.lnoded = lnoded;
    dat.rnoded = rnoded;

    //modify the links collection in-place to refer to the new nodes collections.
    for(var i=0; i < dat.links.length; ++i){
      var link = dat.links[i];
      link.source = lnoded[link.source.fullname];
      link.target = rnoded[link.target.fullname];
    }

    return dat;
}

//
// Add lnodes, rnodes, m1nodes, m2nodes, lgroups, rgroups, mgroups where 'l' contains all sources and 'r' all targets.   Nodes and groups that are both sources
// and targets will appear in both sets. m2nodes and m1nodes are of course identical.
//
function splitSourceTargetMiddle(dat){

  var lnodes = [];
  var rnodes = [];
  var m1nodes = [];
  var m2nodes = [];
  var lgroups = [];
  var rgroups = [];
  var mgroups = [];
  var mgroupd = {};
  var lgroupd = {};
  var rgroupd = {};
  var lnoded = {};
  var rnoded = {};
  var m1noded = {};
  var m2noded = {};

    for(fullname in dat.nodes){
      var field = dat.nodes[fullname];
      field.marker="original";

      if(field.hasSources && !field.hasTargets){
        var newfield = clone(field);
        newfield.marker="rcopy";
        rnodes.push(newfield);
        rnoded[fullname] = newfield;
      }

      if(field.hasTargets && !field.hasSources){
        var newfield = clone(field);
        newfield.marker="lcopy";
        lnodes.push(newfield);
        lnoded[fullname] = newfield;
      }

      if(field.hasTargets && field.hasSources){
        var newfield1 = clone(field);
        var newfield2 = clone(field);
        newfield1.marker="mcopy";
        newfield2.marker="mcopy";
        m1nodes.push(newfield1);
        m1noded[fullname] = newfield1;
        m2nodes.push(newfield2);
        m2noded[fullname] = newfield2;
      }
    }

    for (fullname in dat.pkgs){
      var pkg = dat.pkgs[fullname];
      pkg.marker="original";

      if(pkg.hasSources && !pkg.hasTargets){
        var newpkg = clone(pkg);
        newpkg.marker="rcopy";
        newpkg.children=[];
        for (var i=0; i < pkg.children.length; ++i){
          if(rnoded[pkg.children[i].fullname] != null) newpkg.children.push(rnoded[pkg.children[i].fullname]);
        }
        rgroups.push(newpkg);
        rgroupd[fullname] = newpkg;
      }

      if(pkg.hasTargets && !pkg.hasSources){
        var newpkg = clone(pkg);
        newpkg.marker="lcopy";
        newpkg.children=[];
        for (var i=0; i < pkg.children.length; ++i){
          if(lnoded[pkg.children[i].fullname] != null) newpkg.children.push(lnoded[pkg.children[i].fullname]);
        }
        lgroups.push(newpkg);
        lgroupd[fullname] = newpkg;
      }

      if(pkg.hasTargets && pkg.hasSources){
        var newpkg = clone(pkg);
        newpkg.marker="mcopy";
        newpkg.children=[];
        for (var i=0; i < pkg.children.length; ++i){
          if(m1noded[pkg.children[i].fullname] != null) newpkg.children.push(m1noded[pkg.children[i].fullname]);
          //if(m1noded[pkg.children[i].fullname] != null) newpkg.children.push(m1noded[pkg.children[i].fullname]);
        }
        mgroups.push(newpkg);
        mgroupd[fullname] = newpkg;
      }
    }

    for(var i=0; i < rnodes.length; ++i){
      var node = rnodes[i];
      node.pkg = rgroupd[node.pkg.fullname];
    }

    for(var i=0; i < lnodes.length; ++i){
      var node = lnodes[i];
      node.pkg = lgroupd[node.pkg.fullname];
    }

    for(var i=0; i < m1nodes.length; ++i){
      var node = m1nodes[i];
      node.pkg = mgroupd[node.pkg.fullname];
    }

    for(var i=0; i < m2nodes.length; ++i){
      var node = m2nodes[i];
      node.pkg = mgroupd[node.pkg.fullname];
    }

    rnodes.sort(firstBy("pkgname").thenBy("fullname"));
    lnodes.sort(firstBy("pkgname").thenBy("fullname"));
    m1nodes.sort(firstBy("pkgname").thenBy("fullname"));
    m2nodes.sort(firstBy("pkgname").thenBy("fullname"));

    dat.lnodes = lnodes;
    dat.rnodes = rnodes;
    dat.m1nodes = m1nodes;
    dat.m2nodes = m2nodes;
    dat.lgroups = lgroups;
    dat.rgroups = rgroups;
    dat.mgroups = mgroups;

    //modify the links collection in-place to refer to the new nodes collections.
    for(var i=0; i < dat.links.length; ++i){
      var link = dat.links[i];
      if(lnoded[link.source.fullname]){
        link.source = lnoded[link.source.fullname];
        if(rnoded[link.target.fullname]){
          link.target = rnoded[link.target.fullname];
        } else {
          link.target = m1noded[link.target.fullname];
        }
      }else{
        if(rnoded[link.target.fullname]){
          link.target = rnoded[link.target.fullname];
          link.source = m2noded[link.source.fullname];
        }else{
          link.target = m2noded[link.target.fullname];
          link.source = m1noded[link.source.fullname];
        }
      }
    }

    return dat;
}


/*
  Can handle a 'raw' data set, i.e. no ancestors etc filled in.  
  Adds a 'treeroot' collection to it, which for each 'directlyrelevant' node contains a tree showing ancestry
*/
function extractTree(dat){

  dat.treeroot = [];

  for(var i=0; i < dat.nodea.length; ++i){

    if(dat.nodea[i].directlyrelevant){
      var root = clone(dat.nodea[i]);
      root.children=[];
      root.nameintree = root.fullname;

      recursiveTreeBuild(dat, root, dat.nodea[i], 0, false);

      dat.treeroot.push(root);
    }

  }
  return dat;
}


// b = clone node in the tree we are building.  n = real node under consideration
function recursiveTreeBuild(dat, b, n){

  b.children = [];

  for (var i=0; i < n.sources.length; ++i){
    var src = n.sources[i];
    var newtreenode = clone(src);

    newtreenode.nameintree = b.nameintree + newtreenode.fullname;

    b.children.push(newtreenode);

    recursiveTreeBuild(dat, newtreenode, src);

  }

}


/*
  
  Creates a cola-compatible graph in which links refer to their nodes using index numbers rather than something sensible.

  Nodes are given index numbers.

  a set of group data suitable for cola is also added to dat.

  'groupType' is a string, which specifies what to use for a cola group.  not used right now.

*/

function createColaGraph(dat, groupType){

  for(var i=0;i<dat.nodea.length; ++i){
    dat.nodea[i].cola_index = i;
  }

  var colalinks = [];

  for(var i=0; i< dat.links.length; ++i){
    var link = dat.links[i];
    var colalink = {};
    colalink.link = link;
    colalink.source = link.source.cola_index;
    colalink.target = link.target.cola_index;
    colalink.id = link.source.fullname+link.target.fullname;

    if(colalink.source == null || colalink.target == null){
      console.err("argh, why is this null?");      
    }else{
      colalinks.push(colalink);
    }
  }

  dat.colalinks = colalinks;

  var colagroups = [];

for (fullname in dat.pkgs){
      var pkg = dat.pkgs[fullname];  
    var colagroup = {leaves:[], pkg:pkg, id:pkg.fullname};
    for(var j =0;j<pkg.children.length;++j){
      colagroup.leaves.push(pkg.children[j].cola_index);
    }

    if(colagroup.leaves.length > 0)
      colagroups.push(colagroup);
  }

  dat.colagroups = colagroups;
}



//
// marks nodes, links and groups as relevant or not.  nodes and packages that are directly identified by the filter, as opposed to
// just being related, are marked 'directlyrelevant' as well.
// assumes resolverelatives() etc has been called.
//
function markRelevant(dat, fieldFilterFunc){

  //mark everything irrelevant
  for(var i=0;i<dat.nodea.length;++i){
    dat.nodea.relevant = false;
    dat.nodea.directlyrelevant = false;
  }

  for(fullname in dat.pkgs){
    dat.pkgs[fullname].relevant = false;
    dat.pkgs[fullname].directlyrelevant = false;
  }

  for(var i=0;i<dat.links.length;++i){
    dat.links[i].relevant = false;
    dat.links[i].directlyrelevant = false;
  }

  //mark nodes/pkgs relevant if they directly match or are related to a match
  for(var i=0; i < dat.nodea.length; ++i){
    if(fieldFilterFunc(dat.nodea[i])){
      dat.nodea[i].relevant = true;
      dat.nodea[i].pkg.relevant = true;
      dat.nodea[i].directlyrelevant = true;
      dat.nodea[i].pkg.directlyrelevant = true;
      for(fullname in dat.nodea[i].ancestors){
        dat.nodes[fullname].relevant = true;
        dat.nodes[fullname].pkg.relevant = true;
      }
      for(fullname in dat.nodea[i].descendants){
        dat.nodes[fullname].relevant = true;
        dat.nodes[fullname].pkg.relevant = true;
      }
    }
  }

  for(var i=0; i<dat.links.length; ++i){
    if(dat.links[i].source.relevant && dat.links[i].target.relevant){
      dat.links[i].relevant=true;
    }
  }

  return dat;
}



function copyRelevant(dat){

  var r = {};
  r.nodea = [];
  r.nodes = {};
  r.pkgs = {};
  r.links = [];
  r.glinka = [];
  r.glinks = {};

  for(var i=0; i<dat.nodea.length;++i){
    if(dat.nodea[i].relevant){
      r.nodea.push(dat.nodea[i]);
      r.nodes[dat.nodea[i].fullname] = dat.nodea[i];
    }
  }

  for(fullname in dat.pkgs){
    if(dat.pkgs[fullname].relevant){
      r.pkgs[fullname] = dat.pkgs[fullname];
    }
  }

  for(var i=0; i< dat.links.length; ++i){
    if(dat.links[i].relevant){
      r.links.push(dat.links[i]);
    }
  }

  for(var i=0; i<dat.glinka.length; ++i){
    if(dat.glinka[i].source.relevant && dat.glinka[i].target.relevant){
      r.glinka.push(dat.glinka[i]);
      r.glinks[dat.glinka[i].fullname] = dat.glinka[i];
    }
  }

  //clean packages to remove irrelevant children
  for(fullname in r.pkgs){
      r.pkgs[fullname].children = copyRelevantArray(dat.pkgs[fullname].children);
    }

  //clean nodes to remove irrelevant connections
  for(var i=0; i<r.nodea.length; ++i){
    var n = r.nodea[i];
    n.ancestors=copyRelevantNameSet(dat.nodes, n.ancestors);
    n.descendants=copyRelevantNameSet(dat.nodes, n.descendants);
    n.usources=copyRelevantNameSet(dat.nodes, n.usources);
    n.utargets=copyRelevantNameSet(dat.nodes, n.utargets);
    n.peers=copyRelevantArray(n.peers);
    n.sources=copyRelevantArray(n.sources);
    n.targets=copyRelevantArray(n.targets);
  }

  return r;
}


///////////////////////////////////////////////////////////////////////////////////////////////
// internal functions
///////////////////////////////////////////////////////////////////////////////////////////////

function copyRelevantArray(arr){
  var r = [];

  for(var i=0; i < arr.length; ++i){
    if(arr[i].relevant){
      r.push(arr[i]);
    }
  }
  return r;
}

function copyRelevantSet(set){
  var r = {};

  for(key in set){
    if(set[key].relevant){
      r[key] = set[key];
    }
  }
  return r;
}

function copyRelevantNameSet(nodes, set){
  var r = {};

  for(key in set){
    if(nodes[key].relevant){
      r[key] = set[key];
    }
  }
  return r;
}



//root=node we are annotating, n = node currently under consideration, depth = distance from root, bFilterEncountered = true if we
//had to follow a filter link to get here, bSource = true if we are recursing sourceward.
function recursiveRelatives(dat, root, n, depth, bFilterEncountered, bSource){

  for(var i=0; i < n.links.length; ++i){
    var isFilter = bFilterEncountered;
    if (n.links[i].type == "filter")
      isFilter = true;
    var isSource = n.links[i].source.fullname != n.fullname;

    if(bSource && isSource){
      var p = n.links[i].source;
      if(p.sources.length == 0){
        root.ancestors[p.fullname] = {filter:isFilter, depth:depth, ult:true};
        root.usources[p.fullname] = {filter:isFilter, depth:depth};
        if(p.rdepth < depth) p.rdepth = depth;
      }else{
        root.ancestors[p.fullname] = {filter:isFilter, depth:depth, ult:false};
        recursiveRelatives(dat, root, p, depth+1, isFilter, bSource);
      }
    } 

    if(!bSource && !isSource){
      var p = n.links[i].target;
      if(p.targets.length == 0){
        root.descendants[p.fullname] = {filter:isFilter, depth:depth, ult:true};
        root.utargets[p.fullname] = {filter:isFilter, depth:depth};
        if(p.ldepth < depth) p.ldepth = depth;
      }else{
        root.descendants[p.fullname] = {filter:isFilter, depth:depth, ult:false};
        recursiveRelatives(dat, root, p, depth+1, isFilter, bSource);
      }
    }

  }

}

