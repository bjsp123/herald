

//load, enrich, filter, squash

var bjsJson;
(function (bjsJson) {

	bjsJson.fromJson=fromJson;

	function fromJson(json, filter, squash){

		var world;

		world = loadJson(json)

		enrich(world);

		world = filter(world, filter);

		world = squash(world, squash);

		return world;
	}

	function enrich(world){

		var w = new world();


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

	function loadJson(json){

		var w = new world();

		var raw = json.sources;

		for(var i=0; i<raw.length;++i){
			var row = raw[i];
			lg("Reading asset " + row.fullame);
			var asset = new asset(row.fullname, row.location, row.type, row.owner, row.desc, row.calc);
			w.assets[asset.fullname] = asset;
		}

		var raw = json.terms;

		for(var i=0; i<raw.length;++i){
			var row = raw[i];
			lg("Reading term " + row.code);
			var term = new term(row.code, row.name, row.desc, row.critical);
			w.terms[term.fullname] = term;
		}

		var raw = json.raw;

		for(var i=0; i<raw.length;++i){
			var row = raw[i];
			lg("Reading field " + row.fullname);
			var field = new term(row.fullname, row.fullname.split(":")[1], w.assets[row.fullname.split(":")[0]], w.terms[row.term], row.desc, row.formula);
			w.fields[field.fullname] = field;
			w.fielda.push(field);
			if(field.term) field.term.children.push(field);
			if(field.asset) field.asset.children.push(field);
			}
		}

		var raw = json.raw;

		for(var i=0; i<raw.length;++i){
			var row = raw[i];
			for(var j=0;j < row.usesvalue.length;j++){
				var rel = new rel(w.fields[row.usesvalue[j]], w.fields[row.fullname], "measure");
				w.rels.push(rel);
			}
			for(var j=0;j < row.usesfilter.length;j++){
				var rel = new rel(w.fields[row.usesvalue[j]], w.fields[row.fullname], "filter");
				w.rels.push(rel);
			}
		}

		w.fielda.sort(firstBy("fullname"));

	}

})(bjs || (bjs = {}));




