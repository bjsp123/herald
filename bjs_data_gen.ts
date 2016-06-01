/// <reference path="bjs_types.ts"/>

namespace bjs_data_gen{

	var r:bjs.fastrandom;


	export function generateWorld(sourcenum:number, sinknum:number, calcnum:number, att_per_asset:number, density:number) : bjs.world {

		var w = new bjs.world();
		r = new bjs.fastrandom();

		var sources:bjs.asset[]=[];
		var calcs:bjs.asset[]=[];
		var superfield:bjs.field[]=[];

		var prefixes = [[],[],[]];

		for(var i=0; i < Math.ceil(sourcenum/3);++i){
			var p = genPrefix(0) + "." + genItem(0);
			prefixes[0].push(p);
		}

		for(var i=0; i < Math.ceil(calcnum/3);++i){
			var p = genPrefix(1) + "." + genItem(1);
			prefixes[1].push(p);
		}

		for(var i=0; i < Math.ceil(sinknum/3);++i){
			var p = genPrefix(2) + "." + genItem(2);
			prefixes[2].push(p);
		}

		for(var i=0;i < sourcenum; ++i){
			var a = genRandomAsset(0, w, prefixes[0], att_per_asset, density, null, null);
			sources.push(a);
			if(r.roll(30)){
				superfield.push(r.element(a.children));
			}
		}

		for(var i=0;i < calcnum; ++i){
			var a = genRandomAsset(1, w, prefixes[1], att_per_asset, density, sources, superfield);
			sources.push(a);
			calcs.push(a);
			if(r.roll(30)){
				superfield.push(r.element(a.children));
			}
		}

		for(var i=0;i < sinknum; ++i){
			var a = genRandomAsset(2, w, prefixes[2], att_per_asset, density, calcs, superfield);
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

	function genRandomAsset(xfactor:number, w:bjs.world, prefix:string[], attrs:number, density:number, srcs:bjs.asset[], superfields:bjs.field[]):bjs.asset{

		var name;

		if(r.roll(2)){
			name = genPrefix(xfactor) + "." + genItem(xfactor) + "." + genTLA(xfactor);
		}else{
			name = r.element(prefix) + "." + genTLA(xfactor);
		}

		var ass = new bjs.asset(name, name, "", genType(xfactor), genOwner(xfactor), genDept(xfactor), "", "", 0, 0, 0, "");
		ass.notbefore = r.next(6);
		ass.latency = 1;
		w.assets[name] = ass;

		attrs += r.next(5)-2;
		attrs += xfactor * 2;
		if(r.roll(2)) attrs *=2;
		if(r.roll(2)) attrs *=2;
		if(r.roll(2)) attrs *=2;

		if(xfactor==0)
			if(r.roll(5)) attrs = 1;

		var dolinks:boolean = srcs && srcs.length > 0;
	
		var dens = density + r.next(3) - 1;

		var fanfield = dolinks?r.element(r.element(srcs).children):null;
		var keysrc = dolinks?r.element(srcs):null;
		var secondsrc = dolinks?r.element(srcs):null;
		var importance = r.next(5);


		var fnamebase = genFieldBase(xfactor)+genFieldMiddle(xfactor);

		var dofan =r.roll(5);
		var dodirect=r.roll(3);
		var dosuperfield=r.roll(5) && superfields && superfields.length > 0;


		for(var i=0; i < attrs; ++i){
			if(r.roll(10)){
				fnamebase = genFieldBase(xfactor)+genFieldMiddle(xfactor);
			}
			var fname = fnamebase + genFieldSuffix(xfactor);
			var f = new bjs.field(name + ":" + fname, fname, "", ass, null, "", "", "", 0, 0, 0, "");
			if(xfactor==2)f.importance = importance;
			w.fields[f.fullname] = f;
			w.fielda.push(f);
			ass.children.push(f);
			f.asset = ass;

			if(!dolinks)
				continue;

			if(dofan){
				var rel = new bjs.rel(fanfield, f, "filter");
				w.rels.push(rel);
			}

			if(dosuperfield){
				var rel = new bjs.rel(r.element(superfields), f, "measure");
				w.rels.push(rel);
			}

			if(dodirect){
				var rel = new bjs.rel(keysrc.children[i%keysrc.children.length], f, "measure");
				w.rels.push(rel);
			}else{

				for(var j=0;j<dens;++j){
					var srcfield = r.element(keysrc.children);
					if (r.roll(3)) srcfield = r.element(secondsrc.children);
					var rel = new bjs.rel(srcfield, f, r.roll(2)?"measure":"filter");
					w.rels.push(rel);
				}
			}

			

			if(r.roll(3)){
				f.quality = 1 + r.next(10)/5;
			}

			if(r.roll(6)){
				f.risk = 1;
			}
		}

		return ass;
	}

}
