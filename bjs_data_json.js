//load, enrich, filter, squash
/*global bjs*/

var bjs_data_json;
(function(bjs_data_json) {

	bjs_data_json.fromJson = fromJson;

	function fromJson(json, f, sq) {

		var world;

		world = loadJson(json);

		world = filter(world, f);

		world = squash(world, sq);

		return world;
	}

	function filter(world, filter) {
		bjs.lg_inf("Filtering");
		var w = new bjs.world();

		for(var i=0; i<world.fielda.length; ++i){
			var f = world.fielda[i];

			if(isMatch(f, filter)){
				bjs.lg_inf("Adding matched field " + f.fullname);
				addFieldToWorld(w, world, f, filter, true);
			}else{
				bjs.lg_inf("Rejecting nonmatched field " + f.fullname);
			}
		}

		for(var i = 0; i <world.rels.length;++i){
			var rel = world.rels[i];
			if(w.fields[rel.source.fullname] && w.fields[rel.target.fullname]){
				var newrel = new bjs.rel(w.fields[rel.source.fullname], w.fields[rel.target.fullname], rel.type);
				w.rels.push(newrel);
			}
		}

		enrich (w);

		return w;
	}

	function squash(world, squash) {
		bjs.lg_inf("Squashing");

		//copy world.
		//can't do this as it ruins the 'directlyrelevant' flag...
		//var w = filter(world, new bjs.filter());
		//so we edit world in place for now, which is bad.  fixme
		var w = world;

		var addedRels = {};

		for(var i=0; i<w.fielda.length; ++i){
			var f = w.fielda[i];

			if(isSquash(f, squash)){
				killAndBypass(w, f);
				i--;
			}
		}

		enrich(w);

		if(squash.el_internals){
			var changed = true;
			while(changed){
				changed = resolveInternalSources(w);
			}
		}


		enrich(w);

		return w;
	}

	function resolveInternalSources(w){

		var changed = false;
		var newrels = [];

		for(var i = 0; i <w.rels.length;++i){
			var rel = w.rels[i];

			if(rel.source.asset == rel.target.asset){

				for(var j=0;j<rel.source.rels.length;++j){
					var srcrel = rel.source.rels[j];
					if(srcrel.target == rel.source){
						var newrel = new bjs.rel(srcrel.source, rel.target);
						newrels.push(newrel);
					}
				}


				bjs.removeItem(w.rels, rel);
				i--;
				changed = true;

			}
		}


		for(var i=0;i<newrels.length;++i){
			w.rels.push(newrels[i]);
		}

		return changed;

	}

	function killAndBypass(w, f){

		bjs.lg_inf("Squashing field " + f.fullname);

		var newrels = [];

		for(var i=0; i<w.rels.length;++i){
			var rel=w.rels[i];
			if(rel.source == f){
				for(var j = 0; j < w.rels.length;++j){
					var srcrel = w.rels[j];
					if(srcrel.target == f){
						var newrel = new bjs.rel(srcrel.source, rel.target, rel.type);
						newrels.push(newrel);
					}
				}
			}
			if(rel.target == f){
				for(var j = 0; j < w.rels.length;++j){
					var tgtrel = w.rels[j];
					if(tgtrel.source == f){
						var newrel = new bjs.rel(rel.source, tgtrel.target, rel.type);
						newrels.push(newrel);
					}
				}
			}
		}

		for(var i=0;i<newrels.length;++i){
			w.rels.push(newrels[i]);
		}

		removeFieldFromWorld(w, f);
	}

	function removeFieldFromWorld(w, f){
		var term = f.term;
		if(term){
			if(term.children.length==1){
				delete w.terms[term.fullname];
			}else{
				bjs.removeItem(term.children, f);
			}
		}
		var asset = f.asset;
		if(asset){
			if(asset.children.length==1){
				delete w.assets[asset.fullname];
			}else{
				bjs.removeItem(asset.children, f);
			}
		}

		delete w.fields[f.fullname];
		bjs.removeItem(w.fielda, f);

		var rels = [];
		for(var i = 0; i <w.rels.length;++i){
			var rel = w.rels[i];
			if(rel.source != f && rel.target != f){
				rels.push(rel);
			}
		}

		w.rels = rels;

	}


	function addFieldToWorld(w, world, f, filter, directmatch){
		if(w.fields[f.fullname]){
			bjs.lg_inf("Duplicate field being ignored " + f.fullname);
			return;
		}

		//add term
		var term = f.term;
		if(term){
			var newterm = w.terms[f.term.fullname];
			if(newterm==null){
				newterm = new bjs.term(term.code, term.name, term.desc, term.flags);
				w.terms[newterm.fullname] = newterm;
			}
		}

		//add asset
		var asset = f.asset;
		if(asset){
			var newass = w.assets[f.asset.fullname];
			if(newass==null){
				newass = new bjs.asset(asset.name, asset.location, asset.type, asset.owner, asset.desc, asset.calc);
				w.assets[newass.fullname] = newass;
			}
		}

		//add the actual field
		var newfield = new bjs.field(f.fullname, f.name, newass, newterm, f.desc, f.formula, f.flags);
	
		w.fields[newfield.fullname] = newfield;
		w.fielda.push(newfield);

		if(newterm)newterm.children.push(newfield);
		if(newass)newass.children.push(newfield);

		//it will be fun adding processes and owners later!

		if(directmatch){

			newfield.directlyrelevant = true;

			//do we need to add ancestors/descendants?
			if(filter && filter.grab_left){
				for(var fullname in f.ancestors){
					bjs.lg_inf("Adding ancestor " + f.ancestors[fullname]);
					addFieldToWorld(w, world, world.fields[fullname], filter, false);
				}
			}
			if(filter && filter.grab_right){
				bjs.lg_inf("Adding descendant " + f.descendants[fullname]);
				for(var fullname in f.descendants){
					addFieldToWorld(w, world, world.fields[fullname], filter, false);
				}
			}
		}
	}

	function isSquash(field, squash){

		if(squash.el_fields != ""){
			var reg = new RegExp(squash.el_fields, 'i');
			if (reg.exec(field.fullname) != null) {
					return true;
				}
			}
		

		if(squash.el_assets != ""){
			var reg = new RegExp(squash.el_assets, 'i');
			if (reg.exec(field.asset.fullname) != null) {
					return true;
				}
			}
		

		return false;
	}

	function isMatch(field, filter){

		if (filter.only_crit) {
			if(!(field.flags && field.flags.indexOf("critical") != -1))
				return false;
			
		}

		if (filter.inc != "") {
			
			var reg = new RegExp(filter.inc, 'i');
			if (reg.exec(field.fullname) == null) {
					return false;
				}
			}

		if (filter.exc != "") {
			reg = new RegExp(filter.exc, 'i');
			if (reg.exec(field.fullname) != null) {
					return false;
			}
		}

		if (filter.inc_rels != "") {
			reg = new RegExp(filter.inc_rels, 'i');
			var found = false;
			for (var ancestorname in field.ancestors) {
				if (reg.exec(ancestorname) != null) {
					found = true;
				}
			}
			for (var descendantname in field.descendants) {
				if (reg.exec(descendantname) != null) {
					found = true;
				}
			}
			if(found == false) return false;
		}

		if(filter.exc_rels != ""){
			reg = new RegExp(filter.exc_rels, 'i');
			for (var ancestorname in field.ancestors) {
				if (reg.exec(ancestorname) != null) {
					return false;
				}
			}
			for (var descendantname in field.descendants) {
				if (reg.exec(descendantname) != null) {
					return false;
				}
			}
		}

		return true;
	}

	function enrich(w) {

		bjs.lg_inf("Enriching world.");

		//lets make sure this is idempotent.
		w.arels = {};
		w.arela = [];
		for(var i=0; i< w.fielda.length; ++i){
			w.fielda[i].rels = [];
			w.fielda[i].peers = [];
			w.fielda[i].targets = [];
			w.fielda[i].sources = [];
			w.fielda[i].ancestors = {};
			w.fielda[i].descendants = {};
			w.fielda[i].ldepth = -1;
			w.fielda[i].rdepth = -1;
			w.fielda[i].usources = {};
			w.fielda[i].utargets = {};
			w.fielda[i].hasTargets = false;
			w.fielda[i].hasSources = false;
		}

		for (var i = 0; i < w.rels.length; ++i) {
			var rel = w.rels[i];
			var srcfield = rel.source;
			var tgtfield = rel.target;

			srcfield.rels.push(rel);
			tgtfield.rels.push(rel);
			srcfield.peers.push(tgtfield);
			tgtfield.peers.push(srcfield);
			srcfield.targets.push(tgtfield);
			tgtfield.sources.push(srcfield);
			srcfield.hasTargets = true;
			tgtfield.hasSources = true;


			var ar_key = srcfield.asset.fullname + "-" + tgtfield.asset.fullname;

			var arel = w.arels[ar_key];

			if (arel == null) {
				arel = new bjs.arel(srcfield.asset, tgtfield.asset);
				bjs.lg_inf("Created arel " + ar_key);

				arel.source.rels.push(arel);
				arel.target.rels.push(arel);
				arel.source.targets.push(arel.target);
				arel.target.sources.push(arel.source);
				arel.source.hasTargets = true;
				arel.target.hasSources = true;

				w.arels[ar_key] = arel;
			}

			arel.count += 1;

		}

		for (ar_key in w.arels) {
			var arel = w.arels[ar_key];
			w.arela.push(arel);
		}

		bjs.lg_sum("Created " + w.arela.length + " arels");

		bjs.lg_inf("Finding relatives");

		for (var i = 0; i < w.fielda.length; ++i) {

			var f = w.fielda[i];

			recursiveRelatives(w, f, f, 0, false, true);
			recursiveRelatives(w, f, f, 0, false, false);

		}

	}


	//root=node we are annotating, n = node currently under consideration, depth = distance from root, bFilterEncountered = true if we
	//had to follow a filter link to get here, bSource = true if we are recursing sourceward.
	function recursiveRelatives(w, root, f, depth, bFilterEncountered, bSource) {

		for (var i = 0; i < f.rels.length; ++i) {
			var isFilter = bFilterEncountered;
			if (f.rels[i].type == "filter")
				isFilter = true;
			var isSource = f.rels[i].source.fullname != f.fullname;

			if (bSource && isSource) {
				var p = f.rels[i].source;
				if (p.sources.length == 0) {
					root.ancestors[p.fullname] = {
						filter: isFilter,
						depth: depth,
						ult: true
					};
					root.usources[p.fullname] = {
						filter: isFilter,
						depth: depth
					};
					if (p.rdepth < depth) p.rdepth = depth;
				}
				else {
					root.ancestors[p.fullname] = {
						filter: isFilter,
						depth: depth,
						ult: false
					};
					recursiveRelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

			if (!bSource && !isSource) {
				var p = f.rels[i].target;
				if (p.targets.length == 0) {
					root.descendants[p.fullname] = {
						filter: isFilter,
						depth: depth,
						ult: true
					};
					root.utargets[p.fullname] = {
						filter: isFilter,
						depth: depth
					};
					if (p.ldepth < depth) p.ldepth = depth;
				}
				else {
					root.descendants[p.fullname] = {
						filter: isFilter,
						depth: depth,
						ult: false
					};
					recursiveRelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

		}
	}

	function loadJson(json) {

		var w = new bjs.world();

		var raw = json.sources;

		bjs.lg_sum("Reading new world.");

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading asset " + row.fullname);
			var asset = new bjs.asset(row.fullname, row.location, row.type, row.owner, row.desc, row.calc);
			w.assets[asset.fullname] = asset;
		}

		bjs.lg_sum("Read " + w.assets.length + " assets.");

		var raw = json.terms;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading term " + row.code);
			var term = new bjs.term(row.code, row.name, row.desc, row.flags);
			w.terms[term.fullname] = term;
		}

		bjs.lg_sum("Read " + w.terms.length + " terms.");

		var raw = json.raw;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading field " + row.fullname);
			var field = new bjs.field(row.fullname, row.fullname.split(":")[1], w.assets[row.fullname.split(":")[0]], w.terms[row.conceptname], row.desc, row.formula, row.flags);
			w.fields[field.fullname] = field;
			w.fielda.push(field);
			if (field.term) field.term.children.push(field);
			if (field.asset) field.asset.children.push(field);
			if(field.term) {
				field.flags += field.term.flags;
			}
		}

		bjs.lg_sum("Read " + w.fields.length + " fields.");

		var raw = json.raw;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			for (var j = 0; j < row.usesvalue.length; j++) {
				var rel = new bjs.rel(w.fields[row.usesvalue[j]], w.fields[row.fullname], "measure");
				w.rels.push(rel);
			}
			for (var j = 0; j < row.usesfilter.length; j++) {
				var rel = new bjs.rel(w.fields[row.usesfilter[j]], w.fields[row.fullname], "filter");
				w.rels.push(rel);
			}
		}

		bjs.lg_sum("Read " + w.rels.length + " relationships.");

		w.fielda.sort(firstBy("fullname"));


		enrich(w);

		return w;

	}

})(bjs_data_json || (bjs_data_json = {}));
