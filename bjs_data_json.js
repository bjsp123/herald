//load, enrich, filter, squash
/*global bjs*/

var bjs_data_json;
(function(bjs_data_json) {

	bjs_data_json.fromJson = fromJson;

	function fromJson(json, f, sq) {

		var world;

		world = loadJson(json);

		enrich(world);

		world = filter(world, f);

		world = squash(world, sq);

		return world;
	}

	function filter(world, filter) {
		var w = new bjs.world();
		
		


		return world;
	}

	function squash(world, squash) {
		var w = new bjs.world();

		return world;
	}
	
	function isMatch(field, filter){

		if (filter.only_crit) {
			if (field.critical != "Critical")
				return false;
		}

		if (filter.inc != "") {
			
			var reg = new RegExp(filter.inc, 'i');
			if (reg.exec(field.fullname) == null) {
					return false;
				}
			}


		reg = new RegExp(filter.exc, 'i');
		if (reg.exec(n.fullname) != null) {
				return false;
		}


		clauses = exc_rels.trim().split(" ");

		for (var i = 0; i < clauses.length; ++i) {
			var clause = clauses[i];
			if (clause == "") continue;
			var reg = new RegExp(clause, 'i');

			for (var ancestorname in n.ancestors) {
				if (reg.exec(ancestorname) != null) {
					return false;
				}
			}

			for (var descendantname in n.descendants) {
				if (reg.exec(descendantname) != null) {
					return false;
				}
			}
		}

		if (inc_rels.trim() != "") {
			clauses = inc_rels.trim().split(" ");

			var selected = false;

			for (var i = 0; i < clauses.length; ++i) {
				var clause = clauses[i];
				if (clause == "") continue;
				var reg = new RegExp(clause, 'i');


				for (var ancestorname in n.ancestors) {
					if (reg.exec(ancestorname) != null) {
						selected = true;
					}
				}

				for (var descendantname in n.descendants) {
					if (reg.exec(descendantname) != null) {
						selected = true;
					}
				}
			}

			if (!selected) return false;
		}


		return true;
	}

	function enrich(w) {

		bjs.lg_inf("Enriching world.");

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
			var term = new bjs.term(row.code, row.name, row.desc, row.critical);
			w.terms[term.fullname] = term;
		}

		bjs.lg_sum("Read " + w.terms.length + " terms.");

		var raw = json.raw;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading field " + row.fullname);
			var field = new bjs.field(row.fullname, row.fullname.split(":")[1], w.assets[row.fullname.split(":")[0]], w.terms[row.term], row.desc, row.formula);
			w.fields[field.fullname] = field;
			w.fielda.push(field);
			if (field.term) field.term.children.push(field);
			if (field.asset) field.asset.children.push(field);
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


		return w;

	}

})(bjs_data_json || (bjs_data_json = {}));
