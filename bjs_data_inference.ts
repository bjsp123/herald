/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_data_gen.ts"/>

declare var firstBy:any;

namespace bjs_data_inference{

	export function processWorld(world:bjs.world, f, sq):bjs.world{

		world.fielda.sort(firstBy("fullname"));

		enrich(world);

		world = applyRules(world);

		world = filter(world, f);

		world = squash(world, sq);
		
		world = applyRules(world);
		
		return world;
	}

	// Placeholder for disconnected rules functionality.
	// edits the world in-place to apply hardcoded rules.
	function applyRules(world:bjs.world):bjs.world {
		
		for(var i=0; i < world.fielda.length; ++i){
			var f = world.fielda[i];
			
			if(f.fullname.indexOf("ClientData")==0)
				f.cookie = "MIS.Aaa.clientdatacookie" + f.fullname;
			
			if(f.fullname.indexOf("Refin")==0)
				f.cookie = "Aaa" + f.fullname;
				
			if(f.fullname.indexOf("Core.Contracts.Hist")==0)
				f.cookie = "Cust.zzcontractscookie" + f.fullname;
				
			if(f.fullname.indexOf("Compliance.BCBS")==0)
				f.cookie = "MIS.Mart.aacompliancecookie" + f.fullname;
				
			if(f.fullname.indexOf("Core.Syst")==0)
				f.cookie = "Core.Retail.Aaacookie" + f.fullname;
				
			if(f.fullname.indexOf("Core.Cont")==0)
				f.cookie = "Core.AAaacookie" + f.fullname;
				
			if(f.fullname.indexOf("Reference")==0)
				f.cookie = "CustQuality.ZZcookie" + f.fullname;
				
			if(f.fullname.indexOf("MIS.Staging")==0)
				f.cookie = "MIS.Mart.Dddcookie" + f.fullname;
				
			if(f.fullname.indexOf("Core.Retail.Bal")==0)
				f.cookie = "MIS.Mart.Aaacookie" + f.fullname;

			if(f.asset.owner.indexOf("known")!=-1)
				f.risk += 0.2;

			if(f.asset.type.indexOf("xcel")!=-1)
				f.risk += 0.2;

			if(f.asset.type.indexOf("mdb")!=-1)
				f.quality *= 1.1;
		}
		
		return world;
		
	}

	function filter(world:bjs.world, filter:bjs.filter):bjs.world {
		bjs.lg_inf("Filtering");
		var w = new bjs.world();

		for(var i=0; i<world.fielda.length; ++i){
			var f = world.fielda[i];

			if(isDirectMatch(f, filter)){
				bjs.lg_inf("Adding matched field " + f.fullname);
				addFieldToNewWorld(w, world, f, filter, true);
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

	function squash(world:bjs.world, squash:bjs.squash):bjs.world {
		bjs.lg_inf("Squashing");

		//copy world.
		//can't do this as it ruins the 'directlyrelevant' flag...
		//var w = filter(world, new bjs.filter());
		//so we edit world in place for now, which is bad.  fixme
		var w = world;

		for(var i=0; i<w.fielda.length; ++i){
			var f = w.fielda[i];

			if(isSquashEliminate(f, squash)){
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
		
		for(var assetfullname in w.assets){
			var ass = w.assets[assetfullname];

			if(isSquashCompress(ass, squash)){
				compressAsset(w, ass);
			}
		}

		enrich(w);

		return w;
	}

	function resolveInternalSources(w:bjs.world):boolean{

		var changed = false;
		var newrels = [];

		for(var i = 0; i <w.rels.length;++i){
			var rel = w.rels[i];

			if(rel.source.asset == rel.target.asset){

				for(var j=0;j<rel.source.rels.length;++j){
					var srcrel = rel.source.rels[j];
					if(srcrel.target == rel.source){
						var newrel = new bjs.rel(srcrel.source, rel.target, rel.type);
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
	
	function compressAsset(w:bjs.world, ass:bjs.asset){
		
		bjs.lg_inf("Compressing asset " + ass.fullname);
		
		if(ass.children.length < 2)
			return;
			
		var newfield = new bjs.field(ass.fullname+":all", "all", "placeholder", ass, null, "desc", "Placeholder representing many fields.", "logical", 1, 1, 0, ass.size, 1, "");
		
		addFieldToWorld(w, newfield);
		
		var desc = "Represents fields:\n";
		var quality = 1;
		var risk = 1;
		
		for(var i=0; i<w.fielda.length; ++i){
			var f = w.fielda[i];

			if(f.asset == ass && f.type != "placeholder"){
				desc += f.name + "\n";
				if(f.quality < quality) quality = f.quality;
				if(f.risk > risk) risk = f.risk;
				killAndRedirect(w, f, newfield);
				--i;
			}
		}
		
		newfield.desc = desc;
		newfield.quality = quality;
		newfield.risk = risk;
		ass.children = [newfield];
		
	}

	function killAndBypass(w:bjs.world, f:bjs.field):void{

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
	
	//Remove a node, moving its rels to point to another node
	//rels that would thus become circular are simply dropped.
	function killAndRedirect(w:bjs.world, f:bjs.field, newfield:bjs.field):void{

		bjs.lg_inf("Squashing and redirecting field " + f.fullname);

		var newrels = [];

		for(var i=0; i<w.rels.length;++i){
			var rel=w.rels[i];
			if(rel.source == f){
				if(newfield==rel.target) continue;
				var newrel = new bjs.rel(newfield, rel.target, rel.type);
					newrels.push(newrel);
			}
			if(rel.target == f){
				if(newfield==rel.source) continue;
				var newrel = new bjs.rel(rel.source, newfield, rel.type);
					newrels.push(newrel);
			}
		}

		for(var i=0;i<newrels.length;++i){
			w.rels.push(newrels[i]);
		}

		removeFieldFromWorld(w, f);
	}


	function removeFieldFromWorld(w:bjs.world, f:bjs.field):void{
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


	function addFieldToNewWorld(w:bjs.world, world:bjs.world, f:bjs.field, filter:bjs.filter, directmatch:boolean):void{
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
				newass = new bjs.asset(asset.fullname, asset.name, asset.location, asset.type, asset.owner, asset.dept, asset.desc, asset.calc, asset.notbefore, asset.latency, asset.risk, asset.crunchfactor, asset.comment, asset.layer);
				w.assets[newass.fullname] = newass;
			}
		}

		//add the actual field
		var newfield = new bjs.field(f.fullname, f.name, f.type, newass, newterm, f.desc, f.formula, f.flags, f.quality, f.risk, f.importance, f.size, f.cardinality, f.comment);
	
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
					addFieldToNewWorld(w, world, world.fields[fullname], filter, false);
				}
			}
			if(filter && filter.grab_right){
				bjs.lg_inf("Adding descendant " + f.descendants[fullname]);
				for(var fullname in f.descendants){
					addFieldToNewWorld(w, world, world.fields[fullname], filter, false);
				}
			}
		}
	}
	
	function addFieldToWorld(w:bjs.world, f:bjs.field):void{
		if(w.fields[f.fullname]){
			bjs.lg_inf("Duplicate field being ignored " + f.fullname);
			return;
		}

		//add term
		var term = f.term;
		if(term){
			var newterm = w.terms[f.term.fullname];
			if(newterm==null)
				bjs.lg_err("Tried to add field " + f.fullname + " but term " + f.term.name + " not found.");
		}

		//add asset
		var asset = f.asset;
		if(asset){
			var newass = w.assets[f.asset.fullname];
			if(newass==null)
				bjs.lg_err("Tried to add field " + f.fullname + " but asset " + f.asset.fullname + " not found.");
		}

		w.fields[f.fullname] = f;
		w.fielda.push(f);

		if(newterm)newterm.children.push(f);
		if(newass)newass.children.push(f);

	}

	function isSquashEliminate(field:bjs.field, squash:bjs.squash):boolean{

		if(squash.el_fields != ""){
			var reg = new RegExp(squash.el_fields, 'i');
			if (bjs.matchField(squash.el_fields, field, true)) {
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
	
	function isSquashCompress(ass:bjs.asset, squash:bjs.squash):boolean{
		if(squash.cr_assets != ""){
			var reg = new RegExp(squash.cr_assets, 'i');
			if (reg.exec(ass.fullname) != null) {
				return true;
			}
		}
	}

	export function isMatch(field:bjs.field, filter:bjs.filter):boolean{

		if(field == null)
			return false;
		
		if(isDirectMatch(field, filter))
			return true;

		if(filter.grab_left){
			for (var ancestorname in field.ancestors) {
				if (isDirectMatch(field.ancestors[ancestorname].field, filter)) {
					return true;
				}
			}
		}

		if(filter.grab_right){
			for (var descendantname in field.descendants) {
				if (isDirectMatch(field.descendants[descendantname].field, filter)) {
					return true;
				}
			}
		}

		return false;
	}

	export function isDirectMatch(field:bjs.field, filter:bjs.filter):boolean{

		if(filter.noImplicitAny && filter.inc == ""){
			return false;
		}

		if (filter.inc != "") {
			if(!bjs.matchField(filter.inc, field, true))
				return false;
			}

		if (filter.exc != "") {
			var reg = new RegExp(filter.exc, 'i');
			if(bjs.matchField(filter.exc, field, true)){
				return false;
			}
		}

		if (filter.inc_rels != "") {
			var found = false;
			for (var ancestorname in field.ancestors) {
				if (bjs.matchField(filter.inc_rels, field.ancestors[ancestorname].field, true)) {
					found = true;
				}
			}
			for (var descendantname in field.descendants) {
				if (bjs.matchField(filter.inc_rels, field.descendants[descendantname].field, true)) {
					found = true;
				}
			}
			if(found == false) return false;
		}

		if(filter.exc_rels != ""){
			reg = new RegExp(filter.exc_rels, 'i');
			for (var ancestorname in field.ancestors) {
				if (bjs.matchField(filter.exc_rels, field.ancestors[ancestorname].field, true)) {
					return false;
				}
			}
			for (var descendantname in field.descendants) {
				if (bjs.matchField(filter.exc_rels, field.descendants[descendantname].field, true)) {
					return false;
				}
			}
		}

		return true;
	}

	function enrich(w:bjs.world):void {

		bjs.lg_inf("Enriching world.");

		//lets make sure this is idempotent.
		w.arels = {};
		w.arela = [];
		for(var i=0; i< w.fielda.length; ++i){
			w.fielda[i].resetvolatile();
		}
		
		for(var assname in w.assets){
			w.assets[assname].resetvolatile();
		}

		for (var i = 0; i < w.rels.length; ++i) {
			var rel = w.rels[i];
			var srcfield = rel.source;
			var tgtfield = rel.target;

			if(srcfield == null){
				bjs.lg_err("Bad rel, no src: " + tgtfield.fullname);
			}
			if(tgtfield == null){
				bjs.lg_err("Bad rel, no tgt: " + srcfield.fullname);
			}

			srcfield.rels.push(rel);
			tgtfield.rels.push(rel);
			srcfield.peers.push(tgtfield);
			tgtfield.peers.push(srcfield);
			srcfield.targets.push(tgtfield);
			tgtfield.sources.push(srcfield);


			var ar_key = srcfield.asset.fullname + "-" + tgtfield.asset.fullname;

			var arel = w.arels[ar_key];

			if (arel == null) {
				arel = new bjs.arel(srcfield.asset, tgtfield.asset, 0, rel.type);
				bjs.lg_inf("Created arel " + ar_key);

				arel.source.arels.push(arel);
				arel.target.arels.push(arel);
				arel.source.targets.push(arel.target);
				arel.target.sources.push(arel.source);

				w.arels[ar_key] = arel;
			}

			arel.count += 1;
			
			if(rel.type == "value"){
				arel.type = "value";
			}

		}

		for (ar_key in w.arels) {
			var arel = w.arels[ar_key];
			w.arela.push(arel);
		}

		bjs.lg_sum("Created " + w.arela.length + " arels");

		bjs.lg_inf("Finding relatives");

		for (var i = 0; i < w.fielda.length; ++i) {
			var f = w.fielda[i];
			recursiveFieldCalculations(w, f);
			recursiveLeftwardFieldCalculations(w, f);
			recursiveRelatives(w, f, f, 1, false, true);
			recursiveRelatives(w, f, f, 1, false, false);
		}
		
		
		bjs.lg_inf("Finding asset relatives");
		
		for (var assetfullname in w.assets){
			var ass = w.assets[assetfullname];
			recursiveAssetCalculations(w, ass);
			recursiveARelatives(w, ass, ass, 1, false, true);
			recursiveARelatives(w, ass, ass, 1, false, false);
		}
		
		//fixes up the rhs of the time critical path
		for (assetfullname in w.assets){
			var ass = w.assets[assetfullname];
			var latest_src = ass.notbefore;
			var limiter:bjs.asset = null;
			for(var influencename in ass.ancestors){
				var inf = ass.ancestors[influencename];
				if(inf.asset.effnotbefore > latest_src){
					latest_src = inf.asset.effnotbefore;
					limiter = inf.asset;
				}
			}
			if(limiter){
				ass.ancestors[limiter.fullname].tcritpath = true;
			}
		}
	}

	function recursiveAssetCalculations(w:bjs.world, ass:bjs.asset):void{

		if(ass.effnotbefore == null) {

            var latest_src = ass.notbefore;
            for (var i = 0; i < ass.sources.length; ++i) {
                var srcass = ass.sources[i];
                if (ass == srcass) continue;
                recursiveAssetCalculations(w, srcass);
                if (srcass.effnotbefore > latest_src) {
                    latest_src = srcass.effnotbefore;
                }
            }
            ass.effnotbefore = latest_src + ass.latency;
        }

        if(ass.size == 0){
			for (var i=0; i< ass.children.length; ++i) {
				var f = ass.children[i];
				if(f.isPK()) {
					ass.rowcount *= f.cardinality;
                }else{
					ass.rowsize += f.size;
				}
			}

			ass.size = ass.rowcount * ass.rowsize * ass.crunchfactor;

			if(isNaN(ass.size)){
				bjs.lg_err("Unable to calculate size for asset " + ass.fullname);
			}
		}
	}
	
	function recursiveFieldCalculations(w:bjs.world, f:bjs.field):void{

		if(f.effrisk != null){
			return;
		}

		f.effrisk = f.risk + f.asset.risk;
		f.effquality = f.quality;
		f.effnolineage = f.hasNoLineage();

		for(var i=0;i<f.sources.length;++i){
			var src = f.sources[i];
			recursiveFieldCalculations(w, src);
			f.effrisk += src.effrisk;
			if(f.effrisk > 5)f.effrisk = 5;
			f.effquality *= src.effquality;
			if(f.effquality > 10) f.effquality = 10;
			if(src.effnolineage) f.effnolineage = true;
		}
	}
	
	function recursiveLeftwardFieldCalculations(w:bjs.world, f:bjs.field, depth:number=0):void{

		if(f.effimportance != null){
			return;
		}
		
		if(depth > 100){
			bjs.lg_err("Recursion problem: " + f.fullname);
			return;
		}
		
		var most_imp_target = f.importance;
		for(var i=0;i<f.targets.length;++i){
			var tgt = f.targets[i];
			recursiveLeftwardFieldCalculations(w, tgt,depth+1);
			if(tgt.effimportance > most_imp_target){
				most_imp_target = tgt.effimportance;
			}
		}

		f.effimportance = most_imp_target;
	}


	function recursiveARelatives(w:bjs.world, root:bjs.asset, a:bjs.asset, depth:number, bFilterEncountered:boolean, bSource:boolean):void {

		if(depth > 100){
			bjs.lg_err("Recursion problem: root " + root.fullname + " " + a.fullname);
			return;
		}
		
		for (var i = 0; i < a.arels.length; ++i) {
			var isFilter = bFilterEncountered;
			if (a.arels[i].type == "filter")
				isFilter = true;
				
			if(a.arels[i].source.fullname == a.arels[i].target.fullname){//assets may have internal relationships
				continue;	
			}
			
			var isSource = a.arels[i].source.fullname != a.fullname;
			
			var lastReady = 0;

			if (bSource && isSource) {
				var p = a.arels[i].source;
				if (p.rdepth < depth) p.rdepth = depth;
				if (p.sources.length == 0) {
					root.ancestors[p.fullname] = new bjs.ainfluence(p, depth, isFilter, true, p.effnotbefore == lastReady);
				}
				else {
					root.ancestors[p.fullname] = new bjs.ainfluence(p, depth, isFilter, false, p.effnotbefore == lastReady);
					//bjs.lg_err("R: " + root.fullname + " " + p.fullname + " " + depth);
					recursiveARelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

			if (!bSource && !isSource) {
				var p = a.arels[i].target;
				if (p.ldepth < depth) p.ldepth = depth;
				if (p.targets.length == 0) {
					root.descendants[p.fullname]  = new bjs.ainfluence(p, depth, isFilter, true, false); //tcritpath is filled in in a separate sweep later
				}
				else {
					root.descendants[p.fullname] = new bjs.ainfluence(p, depth, isFilter, false, false);
					//bjs.lg_err("R: " + root.fullname + " " + p.fullname + " " + depth);
					recursiveARelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

		}
	}

	//root=node we are annotating, n = node currently under consideration, depth = distance from root, bFilterEncountered = true if we
	//had to follow a filter link to get here, bSource = true if we are recursing sourceward.
	function recursiveRelatives(w:bjs.world, root:bjs.field, f:bjs.field, depth:number, bFilterEncountered:boolean, bSource:boolean):void {

		for (var i = 0; i < f.rels.length; ++i) {
			var isFilter = bFilterEncountered;
			if (f.rels[i].type == "filter")
				isFilter = true;
			var isSource = f.rels[i].source.fullname != f.fullname;

			if (bSource && isSource) {
				var p = f.rels[i].source;
				if (p.rdepth < depth) p.rdepth = depth;
				if (p.sources.length == 0) {
					root.ancestors[p.fullname] = new bjs.influence(p, depth, isFilter, true);
					root.usources[p.fullname] = new bjs.influence(p, depth, isFilter, true);
				}
				else {
					root.ancestors[p.fullname] = new bjs.influence(p, depth, isFilter, false);
					recursiveRelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

			if (!bSource && !isSource) {
				var p = f.rels[i].target;
				if (p.ldepth < depth) p.ldepth = depth;
				if (p.targets.length == 0) {
					root.descendants[p.fullname]  = new bjs.influence(p, depth, isFilter, true);
					root.utargets[p.fullname] = new bjs.influence(p, depth, isFilter, true);
				}
				else {
					root.descendants[p.fullname] = new bjs.influence(p, depth, isFilter, false);
					recursiveRelatives(w, root, p, depth + 1, isFilter, bSource);
				}
			}

		}
	}

	

}
