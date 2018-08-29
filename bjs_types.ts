/// <reference path="bjs_misc.ts"/>


namespace bjs {
	
	export interface IMap<T> {
    	[K: string]: T;
	}
	
	export interface cloneable {
		clone():cloneable;
	}

    export const enum handed {
        left,
        right,
        low,
        row,
        column,
        leftright,
        none
    }

    export const enum infFlag{
    	all,
    	immediate,
    	ultimate
    }

    export const enum colorplan {
    	flat,
    	cat,
    	asset,
    	block
    }

    export const enum linkColorplan {
    	bytype,
    	bynode
    }

    export const enum floworder {
    	depth,
    	shallowness,
    	timing
    }

    export const enum blockplan {
    	none,
    	type,
    	owner,
    	dept,
    	cat
    }

    export const enum xyorder {
    	depth,
    	shallowness,
    	timing,
    	quality,
    	risk,
    	type,
    	owner,
    	dept,
    	asset,
    	importance,
    	term,
    	complexity,
    	influence,
    	filters,
    	dependencies,
    	focus
    }

    export const enum showDetail {
    	none,
    	risk,
    	quality,
    	importance,
    	nolineage,
    	timing
    }
    
/////////// core data model
	
	
	export class term implements cloneable{
		children: field[]=[];
		fullname:string;
		itemtype = "term";
		
		constructor(public code:string, public name:string, public desc:string, public flags:string){
			this.fullname = code;
			if (code == null || code == "") 
				bjs.lg_err("Tried to create term with no code");
		}
		
		public clone():term {
			return new term(this.code, this.name, this.desc, this.flags);
		}
	}
	
	export class asset implements cloneable{
		
		arels: arel[] = [];
		peers: asset[] = [];
		sources: asset[] = [];
		targets: asset[] = [];
		children: field[] = [];
		ldepth = 0;
		rdepth = 0;
		
		ancestors: IMap<ainfluence> = {};
		descendants: IMap<ainfluence> = {};

		effnotbefore: number = null;
		
		constructor(public fullname: string, public name: string, public location: string, public type: string, public owner: string, public dept:string, public desc: string, public calc: string, public notbefore: number, public latency: number, public risk: number, public comment: string) {
			if (name == null || name == "") 
				bjs.lg_err("Tried to create unnamed asset");
			if(risk == null || risk == undefined)
				this.risk = 0;
			if(notbefore==null || notbefore == undefined)
				this.notbefore = 0;
			if(latency==null || latency == undefined)
				this.latency = 1;
		}
			
		public resetvolatile(){
			this.arels = [];
			this.peers = [];
			this.targets = [];
			this.sources = [];
			this.ancestors = {};
			this.descendants = {};
			this.ldepth = 0;
			this.rdepth = 0;
			this.effnotbefore = null;
		}
		
		public hasSources():boolean {
			return this.sources.length > 0;
		}
		
		public hasTargets():boolean {
			return this.targets.length > 0;
		}
		
		public clone():asset{
			return new asset(this.fullname, this.name, this.location, this.type, this.owner, this.dept, this.desc, this.calc, this.notbefore, this.latency, this.risk, this.comment);
		}
	}
	
	export class field implements cloneable{
	
		cookie: string = "";
		
		rels: rel[] = [];
		peers: field[] = [];
		sources: field[] = [];
		targets: field[] = [];
		ancestors: IMap<influence> = {};
		descendants: IMap<influence> = {};
		ldepth = 0;
		rdepth = 0;
		usources: IMap<influence> = {};
		utargets: IMap<influence> = {};
		directlyrelevant = false; //NB this is a bit of ephemeral state used in filtering.

		effrisk: number = null;
		effquality: number = null;
		effimportance:number=null;
		effnolineage:boolean=null;
		
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
			if(flags == null || flags == undefined)
				this.flags = "";
			if(importance == null || importance == undefined)
				this.importance = 0;
				
			this.cookie = this.fullname;
		}
		
		public resetvolatile(){
			this.rels = [];
			this.peers = [];
			this.targets = [];
			this.sources = [];
			this.ancestors = {};
			this.descendants = {};
			this.ldepth = 0;
			this.rdepth = 0;
			this.usources = {};
			this.utargets = {};
			this.effrisk = null;
			this.effquality = null;
			this.effimportance = null;
			this.effnolineage = null;
		}
		
		public hasSources():boolean {
			return this.sources.length > 0;
		}
		
		public hasTargets():boolean {
			return this.targets.length > 0;
		}
		
		public clone():field{
			return new field(this.fullname, this.name, this.type, this.asset, this.term, this.desc, this.formula, this.flags, this.quality, this.risk, this.importance, this.comment);
		}
		
		public hasNoLineage():boolean{
			return this.sources.length == 0 && this.formula.length == 0;
		}

		public isLogical():boolean{
			if(this.flags.search("logical") != -1) return true;
			return false;
		}

		public getComplexity():number {
			return bjs.getComplexity(this);
		}
		
		public getInfluence():number {
			return bjs.getInfluence(this);
		}
		
		public getFilters():number {
			return bjs.getFilters(this);
		}
		
		public getDependencies():number {
			return bjs.getDependencies(this);
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
		cookie: string="";
		group: group = null;
		x: number = -1;
		y: number = -1;
		x0: number = -1; //'hiding' position of node, for use in expand/collapse
		y0: number = -1;
		width: number = -1;
		height: number = -1;//for cola
		children: node[]=[];//for use in tree structures, blank otherwise
		parent: node;//for use in tree
		nameintree: string="";//ditto
		handed: bjs.handed=bjs.handed.low;
		cola_index: number = -1;//or is this really ephemeral state?
		idx: number = -1; // holds the node's position in an array in some cases
		
		constructor(public view:view, public mv: mv, public field: field){
			if (field == null) 
				bjs.lg_warn("Tried to create node without field");
			
			this.fullname = field?field.fullname:"synthetic";
			this.cookie = field?field.cookie:"synthetic";
		}

		public isLogical():boolean{
			if(this.field==null) return true;
			return false;
		}

		public isNFLogical():boolean{
			if(this.field==null) return true;
			if(this.field.isLogical()) return true;
			return false;
		}
	}

	export class block{
		itemtype = "block"
		field_count:number = 0;
		asset_count:number = 0;
		sources:IMap<block>={};
		targets:IMap<block>={};
		sourcea:block[]=[];
		targeta:block[]=[];
		x:number=0;
		y:number=0;//cola would add them in anyway

		width: number = -1;
		height: number = -1;//for cola
		cola_index: number = -1;//or is this really ephemeral state?
		padding: number = 0;//for cooooola

		constructor(public view:view, public mv:mv, public fullname, public name, public kind){

		}

	}

	export class link{
		itemtype="link";
		id: string;
		
		constructor (public source: node, public target: node, public rel: rel){
			//if(rel == null)
			//	bjs.lg_err("Tried to create link with no rel.");
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
		groups: number[]=[];//annd again.
		children: node[]=[];
		x: number = -1;
		y: number = -1;
		height: number = -1;
		width: number = -1;
		cola_index:number = -1;
		handed: bjs.handed=bjs.handed.low;
		padding = -1;//used by cola
		pts:pt[] = null; //points represent a dependency seen as a point rather than a link
		
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
		blocks: IMap<block>={};
		blocka: block[]=[];
		
		pts: pt[]=[];
		
		constructor(public world:world){
			bjs.lg_inf("Creating mv");	
		}
	}

	
/////////////// other

	export class filter{
		
		constructor(public inc: string, public exc: string, public inc_rels: string, public exc_rels: string, public grab_left: boolean, public grab_right: boolean, public noImplicitAny:boolean){
			this.inc = this.inc.trim();
			this.exc = this.exc.trim();
			this.inc_rels = this.inc_rels.trim();
			this.exc_rels = this.exc_rels.trim();
		}
		
	}
	
	export class squash{
		
		constructor(public el_fields:string, public el_assets: string, public cr_assets:string, public el_internals:boolean){
			this.el_fields = this.el_fields.trim();
			this.el_assets = this.el_assets.trim();
			this.cr_assets = this.cr_assets.trim();
		}
	}
	
	export class config{
		public optimize:boolean=false;
		public reorder:boolean=false;
		public infFlag:bjs.infFlag=bjs.infFlag.all;
		public nodeColorplan:bjs.colorplan=colorplan.cat;
		public linkColorplan:bjs.linkColorplan=linkColorplan.bynode;
		public showDetail:bjs.showDetail=showDetail.none;
		public floworder:bjs.floworder=floworder.shallowness;
		public xorder:bjs.xyorder=xyorder.owner;
		public yorder:bjs.xyorder=xyorder.dept;
		public zorder:bjs.xyorder=xyorder.type;
		public blockplan:bjs.blockplan=blockplan.none;
		public color = d3.scale.ordinal().range( ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666969"]);
        public detailColor = d3.scale.quantile().range(["#0d2","#0c3","#0a5","#287","#469","#649","#8a7","#a25","#c03","#d02","#e01"]).domain([0,1]);

	}

	export class dimensions{
		public node_r=9;
		public left_edge=100;
		public right_edge=1600;
		public top_edge=100;
		public bottom_edge=1200;
		public groupbar_width=20;
		public group_spacing=20;
		public bundle_offs=150;
		public groupbar_offs=125;
		public big_limit=120;
		public duration=500;
	}

	export interface view{
		render(svg: any, w: bjs.world, c: bjs.config, f:bjs.filter, d:bjs.dimensions):void;
		svg:any;
		config:config;
		mv:mv;
		focus:filter;
		dims:dimensions;
	}

}
