/// <reference path="bjs_types.ts"/>

namespace bjs_data_gen{

	var r:bjs.fastrandom;


	export function generate(sourcenum:number, sinknum:number, calcnum:number, att_per_asset:number, density:number) : bjs.world {

		var w = new bjs.world();

		r = new bjs.fastrandom();

		var sources:bjs.asset[] = [];

		for(var i=0;i<sourcenum; ++i){
			var s = genRandomAsset(0, w, att_per_asset, 0, null, null, null);
			sources.push(s);
		}

		for(var i=0;i<calcnum; ++i){
			var s = genRandomAsset(1, w, att_per_asset, density, r.element(sources), r.element(sources), r.element(sources));
			sources.push(s);
		}

		for(var i=0;i<sinknum; ++i){
			var s = genRandomAsset(2, w, att_per_asset, density, r.element(sources), r.element(sources), r.element(sources));
		}
		
		return w;
	
	}

	function genPrefix(xfactor:number):string{
		var p = [["Core", "Xact", "Mainfrm", "Rec", "Ref", "Bnk"],
				["Book", "Portf", "Proc", "CR", "MR", "MIS", "MO", "Strat", "Global", "Local", "Ledger"],
				["Compl", "Dash", "Risk", "CRO", "Rprt", "Reg", "PnL"]];
			return r.element(p[xfactor]);
	}

	function genItem(xfactor:number):string{
		var p = ["Cmb","Data","Files","Doc","Record","Rec","Sheet","Final","Flash","EOD","Daily","Monthly"];
		return r.element(p);
	}

	function genType(xfactor:number):string{
		var p=[["DB2", "Oracle", "Text", "Ingres"],
				["Oracle", "SSAS", "essBase", "SAS", "Appdata"],
				["PDF", "Excel", "Qlik", "Cube", "Doc"]];
		return r.element(p[xfactor]);
	}

	function genDept(xfactor:number):string{
		var p=[["Banking", "RefData", "MarkData", "IPV", "CRM", "Treasury"],
				["MIS", "RM", "Sales", "Risk", "IT"],
				["Risk", "Compliance", "Reporting", "Budgets"]];
		return r.element(p[xfactor]);
	}

	function genOwner(xfactor:number):string{
		var p=[["Elsa", "Anna", "Lily", "Mark", "Henry_Q", "Clive_J"],
				["Alice_P", "Isa_B", "Bruno_L", "Sylvie_A", "James_G"],
				["Orris_R", "Hank_W", "Leroy_J", "Sam_Lo"]];
		return r.element(p[xfactor]);
	}

	function genTLA(xfactor:number):string{
		var p =["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "M", "N", "P", "R", "S", "T", "V", "X", "X", "Y"];
		var p2 =["A", "E", "I", "O", "S", "R", "0", "1", "2", "3", "4", "5"];
		return r.element(p) + r.element(p) + r.element(p2);
	}

	function genFieldBase(xfactor:number):string{
		var p = ["Ex","Res", "Px", "Fx", "T", "Dt", "Fld", "Attr", "Param", "Col", "Line", "Rec", "Num", "Add"];
		return r.element(p);
	}

	function genFieldMiddle(xfactor:number):string{
		var p = ["t","_", ":", "", "", ""];
		return r.element(p);
	}

	function genFieldSuffix(xfactor:number):string{
		return r.next(1000).toString();
	}

	function genRandomAsset(xfactor:number, w:bjs.world, attrs:number, density:number, src1:bjs.asset, src2:bjs.asset, src3:bjs.asset):bjs.asset{
		var name = genPrefix(xfactor) + "." + genItem(xfactor) + "." + genTLA(xfactor);
		var ass = new bjs.asset(name, name, "", genType(xfactor), genOwner(xfactor), genDept(xfactor), "", "", 0, 0, 0, "");
		ass.notbefore = r.next(6);
		ass.latency = 1;
		w.assets[name] = ass

		attrs += r.next(5)-2;
		if(r.next(10)==1) attrs *=2;

		var dens = density;
		if(dens>0)dens += r.next(2);

		var fanfield = src1?r.element(src1.children):null;


		var fnamebase = genFieldBase(xfactor)+genFieldMiddle(xfactor);

		for(var i=0; i < attrs; ++i){
			if(r.next(10)==1){
				fnamebase = genFieldBase(xfactor)+genFieldMiddle(xfactor);
			}
			var fname = name + ":" + fnamebase + genFieldSuffix(xfactor);
			var f = new bjs.field(fname, fname, "", ass, null, "", "", "", 0, 0, 0, "");
			w.fields[fname] = f;
			w.fielda.push(f);
			ass.children.push(f);
			f.asset = ass;

			if(dens==0)
				continue;

			if(r.next(10)==1){

				var rel = new bjs.rel(fanfield, f, "filter");
				w.rels.push(rel);
			}else if(r.next(10)==1){
				var rel = new bjs.rel(src1.children[i%src1.children.length], f, "measure");
				w.rels.push(rel);
			}else{

				for(var j=0;j<dens;++j){
					var srcfield = r.element(src1.children);
					if (r.next(3)==1 && src2 != null) srcfield = r.element(src2.children);
					if (r.next(9)==1 && src3 != null) srcfield = r.element(src3.children);
					var rel = new bjs.rel(srcfield, f, r.next(2)?"measure":"filter");
					w.rels.push(rel);
				}
			}

			

			if(r.next(8)==1){
				f.quality = 1 + r.next(10)/10;
			}

			if(r.next(16)==1){
				f.risk = 1;
			}
		}

		return ass;
	}

}
