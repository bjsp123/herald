//basic types

namespace bjs {
	
	interface IMap<T> {
    	[K: string]: T;
	}

/////////// core data model
	
	export class term {
		children: field[];
		itemtype = "term";
		
		constructor(public code:string, public name:string, public desc:string, public flags:string){
			if (code == null || code == "") 
				bjs.lg_err("Tried to create term with no code");
		}
	}
	
	export class asset{
		rels: rel[] = [];
		peers: asset[] = [];
		sources: asset[] = [];
		targets: asset[] = [];
		children: field[] = [];
		hasTargets = false;
		hasSources = false;

		effnotbefore: number = null;
		isLatestSrc = false;
		
		constructor(public fullname: string, public name: string, public location: string="", public type: string="", public owner: string="", public dept:string="", public desc: string="", public calc: string="", public notbefore: number=0, public latency: number=0, public risk: number=1, public comment: string="") {
			if (name == null || name == "") 
				bjs.lg_err("Tried to create unnamed asset");
			}
	}
	
	export class field{
		
		rels: rel[] = [];
		peers: field[] = [];
		sources: field[] = [];
		targets: field[] = [];
		ancestors: IMap<field> = {};
		descendants: IMap<field> = {};
		ldepth = -1;
		rdepth = -1;
		usources: IMap<field> = {};
		utargets: IMap<field> = {};
		hasTargets = false;
		hasSources = false;

		effrisk: number = null;
		effquality: number = null;
		
		itemtype = "field";
		
		constructor(public fullname: string, public name:string, public type: string, public asset: asset, public term: term, public desc: string, public formula: string, public flags: string, public quality: number, public risk: number, public comment: string) {
			if (name == null || name == "") 
				bjs.lg_err("Tried to create unnamed field");
			if (asset == null) 
				bjs.lg_err("Tried to create field " + name + " with no asset.");
				
			this.risk = risk + asset.risk;
		}
		
	}
	
	
	export class rel{
		itemtype="rel";
		
		constructor(public source: field, public target: field, public type: string){
			
		}
		
	}
	
	export class arel{
		itemtype = "arel";
		
		constructor(public source: asset, public target: asset, public count: number=0){
			
		}
	}
	

	export class world{
		assets: IMap<asset>={};
		rels: rel[]=[];
		terms: IMap<term>={};
		fields: IMap<field>={};
		fielda: field[]=[];
		arels: IMap<arel>={};
		arela: arel[]=[];
		
		constructor(){
			bjs.lg_inf("Creating new world");
		}
	}
	
//////////////////// view model

	export class node{
		itemtype="node";
		fullname: string="";
		group: group = null;
		x: number = -1;
		y: number = -1;
		
		constructor(public mv: mv, public field: field){
			if (field == null) 
			bjs.lg_err("Tried to create node without field");
			
			this.fullname = field.fullname;
		}
	}

	export class link{
		itemtype="link";
		
		constructor (public source: node, public target: node, public rel: rel){
			if(rel == null)
				bjs.lg_err("Tried to create link with no rel.");
			if (source == null) 
				bjs.lg_err("Tried to create link with null source.  Target is " + target.field.fullname);
			if (target == null) 
				bjs.lg_err("Tried to create group rel with null target.  Source is " + source.field.fullname);
		}
	}

	export class group{
		itemtype = "group";
		fullname: string="";
		children: node[]=[];
		
		constructor(public asset: asset){
			this.fullname=asset?asset.fullname:"anon";
		}
	}
	
	
	export class glink{
		itemtype = "glink";
		
		constructor(public source: group, public target: group, public arel: arel, public size:number=1){
			if(arel) size = arel.count;
		}
	
	}

	export class mv{
		nodea: node[]=[];
		nodes: IMap<node>={};
		links: link[]=[];
		glinks: glink[]=[];
		groups: IMap<group>={};
		groupa: group[]=[];
		treeroots: node[]=[];
		
		constructor(public w:world){
			bjs.lg_inf("Creating mv");	
		}
	}

	
/////////////// other

	export class filter{
		
		constructor(public inc: string="", public exc: string="", public inc_rels: string="", public exc_rels: string="", public only_crit: boolean=false, public grab_left: boolean=true, public grab_right: boolean=true){
			this.inc = this.inc.trim();
			this.exc = this.exc.trim();
			this.inc_rels = this.inc_rels.trim();
			this.exc_rels = this.exc_rels.trim();
		}
		
	}
	
	export class squash{
		
		constructor(public el_fields:string="", public el_assets: string="", public el_internals:boolean=false){
			this.el_fields = this.el_fields.trim();
			this.el_assets = this.el_assets.trim();
		}
	}

}
