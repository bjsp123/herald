/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_data_gen.ts"/>
declare var firstBy:any;

namespace bjs_data_csv{

	var assetNameMap:string[][] =
		[
			["LL_FCT_", "LL.FCT."],
            ["LL_DIM__", "LL.DIM."],
            ["LL_DIM_", "LL.DIM."],
            ["LLL_CATEGORY_", "LLL.CAT."],
            ["LLL_FSC_", "LLL.FSC."],
            ["LL_", "LL.OTHER."]
		];

	function createFullnameFromName(name:string):string{

		for(var i in assetNameMap){
			if(name.indexOf(assetNameMap[i][0]) == 0){
				return name.replace(assetNameMap[i][0], assetNameMap[i][1]);
			}
		}

		return "MISC." + name;
	}

	export function loadCsv(data:string[][], theDate:Date):bjs.world {

		var w = new bjs.world();


		bjs.lg_sum("Reading new csv world.");

		for (var i = 0; i < data.length; ++i) {
			var row = data[i];
			if(row[0]=="asset") {
                bjs.lg_inf("Reading asset " + row[0]);
                var asset = new bjs.asset(
                    createFullnameFromName(row[1]),
                	row[1],
					row[3],
					row[4],
					row[5],
					row[6],
					row[2],
					row[7],
					parseFloat(row[9]),
					parseFloat(row[8]),
					parseFloat(row[12]),
					row[11]);
                w.assets[asset.fullname] = asset;
            }
		}

		bjs.lg_sum("Read " + Object.keys(w.assets).length + " assets.");
/*

		No terms yet

		var raw = json.terms;

		for (var i = 0; i < raw.length; ++i) {
			var row = raw[i];
			bjs.lg_inf("Reading term " + row.code);
			var term = new bjs.term(row.code, row.name, row.desc, row.flags);
			w.terms[term.fullname] = term;
		}

		bjs.lg_sum("Read " + Object.keys(w.terms).length + " terms.");
*/

		for (var i = 0; i < data.length; ++i) {
			var row = data[i];

			if(row[0] == "field") {

                /*
                if(row.from && row.to){
                    if(new Date(row.from) > theDate || new Date(row.to) < theDate){
                        bjs.lg_inf("Skipping out-of-date field " + row.fullname);
                        continue;
                    }
                }
                */

                var assetFullName = createFullnameFromName(row[1]);

                if(!w.assets[assetFullName]){
                	bjs.lg_err(("Asset " + row[1] + " not found for field " + row[2]));
                	continue;
				}

                bjs.lg_inf("Reading field " + row[2]);
                var field = new bjs.field(
					assetFullName + ":" + row[2],
					row[2],
					row[6],
					w.assets[assetFullName],
					null,
					row[3],
					row[4],
					"",
					parseFloat(row[12]),
					parseFloat(row[9]),
					parseFloat(row[3]),
					"");

                w.fields[field.fullname] = field;
                w.fielda.push(field);
                //if (field.term) field.term.children.push(field);
                if (field.asset) field.asset.children.push(field);
                //if (field.term) {
                //    field.flags += field.term.flags;
                //}
            }
		}

		bjs.lg_sum("Read " + w.fielda.length + " fields.");

		for (var i = 0; i < data.length; ++i) {
			var row = data[i];

			/*
			if(row.from && row.to){
				if(new Date(row.from) > theDate || new Date(row.to) < theDate){
					bjs.lg_inf("Skipping out-of-date field " + row.fullname);
					continue;
				}
			}
			*/

			if(row[0] == "transition"){

				var type = row[1];
				var srcasset = createFullnameFromName(row[2]);
				var srcfield=row[3];
				var dstasset= createFullnameFromName(row[4]);
				var dstfield=row[5];

				var srcfull = srcasset + ":" + srcfield;
				var dstfull = dstasset + ":" + dstfield;

				if(!w.fields[srcfull]){
					bjs.lg_err("Missing source field " + srcfull);
					continue;
				}

				if(!w.fields[dstfull]) {
                    bjs.lg_err("Missing dest field " + dstfull);
                }

                var rel = new bjs.rel(w.fields[srcfull], w.fields[dstfull], type);
				w.rels.push(rel);

			}
		}

		bjs.lg_sum("Read " + w.rels.length + " relationships.");

		w.fielda.sort(firstBy("fullname"));

		return w;

	}

	

}
