/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_data_gen.ts"/>
declare var firstBy:any;

namespace bjs_data_json{
	
	export function loadJson(json:any, theDate:Date):bjs.world {

		var w = new bjs.world();

		var raw = json.sources;

		bjs.lg_sum("Reading new world.");

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading asset " + row.fullname);
			var asset = new bjs.asset(row.fullname, row.fullname, row.location, row.type, row.owner, row.dept, row.desc, row.calc, row.notbefore, row.latency, row.risk, 1, row.comment, "");
			w.assets[asset.fullname] = asset;
		}

		bjs.lg_sum("Read " + Object.keys(w.assets).length + " assets.");

		var raw = json.terms;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading term " + row.code);
			var term = new bjs.term(row.code, row.name, row.desc, row.flags);
			w.terms[term.fullname] = term;
		}

		bjs.lg_sum("Read " + Object.keys(w.terms).length + " terms.");

		var raw = json.raw;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			
			if(row.from && row.to){
				if(new Date(row.from) > theDate || new Date(row.to) < theDate){
					bjs.lg_inf("Skipping out-of-date field " + row.fullname);
					continue;
				}
			}
			
			bjs.lg_inf("Reading field " + row.fullname);
			var field = new bjs.field(row.fullname, row.fullname.split(":")[1], row.type, w.assets[row.fullname.split(":")[0]], w.terms[row.conceptname], row.desc, row.formula, row.flags, row.quality, row.risk, row.importance, 1, 1, row.comment);
			w.fields[field.fullname] = field;
			w.fielda.push(field);
			if (field.term) field.term.children.push(field);
			if (field.asset) field.asset.children.push(field);
			if(field.term) {
				field.flags += field.term.flags;
			}
		}

		bjs.lg_sum("Read " + w.fielda.length + " fields.");

		var raw = json.raw;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			
			if(row.from && row.to){
				if(new Date(row.from) > theDate || new Date(row.to) < theDate){
					bjs.lg_inf("Skipping out-of-date field " + row.fullname);
					continue;
				}
			}
			
			for (var j = 0; j < row.usesvalue.length; j++) {
				if(!w.fields[row.usesvalue[j]]){
					bjs.lg_err("No source found for rel " + row.usesvalue[j] + " in " + row.fullname);
				}else{
					var rel = new bjs.rel(w.fields[row.usesvalue[j]], w.fields[row.fullname], "measure");
					w.rels.push(rel);
				}
			}
			for (var j = 0; j < row.usesfilter.length; j++) {
				if(!w.fields[row.usesfilter[j]]){
					bjs.lg_err("No source found for rel " + row.usesfilter[j] + " in " + row.fullname);
				}else{
					var rel = new bjs.rel(w.fields[row.usesfilter[j]], w.fields[row.fullname], "filter");
					w.rels.push(rel);
				}
			}
		}

		bjs.lg_sum("Read " + w.rels.length + " relationships.");

		w.fielda.sort(firstBy("fullname"));

		return w;

	}

}
