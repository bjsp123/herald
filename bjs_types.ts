/// <reference path="bjs_misc.ts"/>


namespace bjs {
	
	export interface IMap<T> {
    	[K: string]: T;
	}

/////////// core data model
	
	export class term {
		children: field[]=[];
		fullname:string;
		itemtype = "term";
		
		constructor(public code:string, public name:string, public desc:string, public flags:string){
			this.fullname = code;
			if (code == null || code == "") 
				bjs.lg_err("Tried to create term with no code");
		}
	}
	
	export class asset{
		arels: arel[] = [];
		peers: asset[] = [];
		sources: asset[] = [];
		targets: asset[] = [];
		children: field[] = [];
		ldepth = -1;
		rdepth = -1;
		
		ancestors: IMap<ainfluence> = {};
		descendants: IMap<ainfluence> = {};

		effnotbefore: number = null;
		
		constructor(public fullname: string, public name: string, public location: string, public type: string, public owner: string, public dept:string, public desc: string, public calc: string, public notbefore: number, public latency: number, public risk: number, public comment: string) {
			if (name == null || name == "") 
				bjs.lg_err("Tried to create unnamed asset");
			if(risk == null || risk == undefined)
				this.risk = 0;
		}
			
		public resetvolatile(){
			this.arels = [];
			this.peers = [];
			this.targets = [];
			this.sources = [];
			this.ancestors = {};
			this.descendants = {};
			this.ldepth = -1;
			this.rdepth = -1;
			this.effnotbefore = null;
		}
		
		public hasSources():boolean {
			return this.sources.length > 0;
		}
		
		public hasTargets():boolean {
			return this.targets.length > 0;
		}
	}
	
	export class field{
		
		rels: rel[] = [];
		peers: field[] = [];
		sources: field[] = [];
		targets: field[] = [];
		ancestors: IMap<influence> = {};
		descendants: IMap<influence> = {};
		ldepth = -1;
		rdepth = -1;
		usources: IMap<influence> = {};
		utargets: IMap<influence> = {};
		directlyrelevant = false; //NB this is a bit of ephemeral state used in filtering.

		effrisk: number = null;
		effquality: number = null;
		effimportance:number=null;
		
		itemtype = "field";
		
		constructor(public fullname: string, public name:string, public type: string, public asset: asset, public term: term, public desc: string, public formula: string, public flags: string, public quality: number, public risk: number, public importance: number, public comment: string) {
			if (name == null || name == "") 
				bjs.lg_err("Tried to create unnamed field");
			if (asset == null) 
				bjs.lg_err("Tried to create field " + name + " with no asset.");
			if(risk == null || risk == undefined)
				this.risk = 0;
			if(quality == null || quality == undefined || quality == 0)
				this.quality = 1;
			if(importance == null || importance == undefined)
				this.importance = 0;
		}
		
		public resetvolatile(){
			this.rels = [];
			this.peers = [];
			this.targets = [];
			this.sources = [];
			this.ancestors = {};
			this.descendants = {};
			this.ldepth = -1;
			this.rdepth = -1;
			this.usources = {};
			this.utargets = {};
			this.effrisk = null;
			this.effquality = null;
			this.effimportance = null;
		}
		
		public hasSources():boolean {
			return this.sources.length > 0;
		}
		
		public hasTargets():boolean {
			return this.targets.length > 0;
		}
		
	}
	
	
	export class rel{
		itemtype="rel";
		
		constructor(public source: field, public target: field, public type: string){
		}
		
	}
	
	export class arel{
		itemtype = "arel";
		
		constructor(public source: asset, public target: asset, public count: number, public type: string){
			
		}
	}
	
	export class influence{
		itemtype = "influence";
		tcritpath:boolean=undefined;
		constructor (public field:field, public depth:number, public filt:boolean, public ult:boolean){
		}
	}
		
	export class ainfluence{
		itemtype = "ainfluence";
		constructor (public asset:asset, public depth:number, public filt:boolean, public ult:boolean, public tcritpath:boolean){
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
		x0: number = -1; //'hiding' position of node, for use in expand/collapse
		y0: number = -1;
		offs: number = -1; //for grid view
		width: number = -1;
		height: number = -1;//for cola
		children: node[]=[];//for use in tree structures, blank otherwise
		parent: node;//for use in tree
		nameintree: string="";//ditto
		cola_index: number = -1;//or is this really ephemeral state?
		idx: number = -1; // holds the node's position in an array in some cases
		
		constructor(public view:view, public mv: mv, public field: field){
			if (field == null) 
				bjs.lg_warn("Tried to create node without field");
			
			this.fullname = field?field.fullname:"synthetic";
		}
	}

	export class link{
		itemtype="link";
		id: string;
		
		constructor (public source: node, public target: node, public rel: rel){
			if(rel == null)
				bjs.lg_err("Tried to create link with no rel.");
			if (source == null) 
				bjs.lg_err("Tried to create link with null source.  Target is " + target.field.fullname);
			if (target == null) 
				bjs.lg_err("Tried to create group rel with null target.  Source is " + source.field.fullname);
				
			this.id = source.fullname + " " + target.fullname;
		}
	}

	export class group{
		itemtype = "group";
		fullname: string="";
		id: string="";//because cola likes to have a property called this.
		leaves: number[]=[];//because cola ditto ditto
		children: node[]=[];
		depth:number=0;
		x: number = -1;
		y: number = -1;
		height: number = -1;
		width: number = -1;
		topy: number = -1;
		bottomy: number = -1;
		topoffs = -1;  //these 3 are for the matrix view.
		bottomoffs = -1;
		offs = -1;
		padding = -1;//used by cola
		pts = null; //points represent a dependency seen as a point rather than a link
		
		constructor(public view:view, public asset: asset){
			this.fullname=asset?asset.fullname:"anon";
			this.id=this.fullname+Math.random();
		}
	}
	
	
	export class glink{
		itemtype = "glink";
		
		constructor(public source: group, public target: group, public arel: arel, public size:number=1){
			if(arel) size = arel.count;
		}
	
	}
	
	export class pt{
		itemtype="pt";
		constructor(public view:view, public key:string, public isFilter:boolean, public isUltimate:boolean, public depth:number, public source:node, public target:node, public sourcepkg:string, public targetpkg:string){
			
		}
	}

	export class mv{
		nodea: node[]=[];
		nodes: IMap<node>={};
		links: link[]=[];
		glinks: glink[]=[];
		groups: IMap<group>={};
		groupa: group[]=[];
		
		
		//this should be handled via interfaces.  For now, though, here are the bits that may or may not get filled in:
		treeroots: node[]=[];
		syntharoot: node;
		
		lgroupa: group[]=[];
		rgroupa: group[]=[];
		mgroupa: group[]=[];
		
		lgroups: IMap<group>={};
		rgroups: IMap<group>={};
		mgroups: IMap<group>={};
		
		lnodea: node[]=[];
		rnodea: node[]=[];
		mnodea: node[]=[];
		m1nodea: node[]=[];
		m2nodea: node[]=[];
		
		lnodes: IMap<node>={};
		rnodes: IMap<node>={};
		m1nodes: IMap<node>={};
		m2nodes: IMap<node>={};
		
		colalinks: any[]=[];
		
		pts: pt[]=[];
		
		constructor(public world:world){
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
	
	export interface view{
		render(svg: any, w: bjs.world, c: any):void;
	}

}
