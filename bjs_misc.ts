declare var $:any;

namespace bjs{

	export var conf = {};

	export function lg_inf(s) {
		//console.log("I: " + s);
	};
	export function lg_sum(s) {
		console.log("S: " + s);
	};
	export function lg_warn(s) {
		console.log("W: " + s);
	};
	export function lg_err(s) {
		console.log("E: " + s);
	};

	export function hover(o) {};


    export class fastrandom {
    	
    	cache = [];
    	idx = 0;
    	
    	constructor(){
    		for (var i = 0; i < 1000; ++i) {
			this.cache[i] = Math.random();
    		}
    	}
    	
    	next(n:number){
    		this.idx++;
    		if(this.idx >= this.cache.length) this.idx=0;
    		
    		return Math.floor(this.cache[this.idx] * n);
    	}
    }
    
    export function removeItem(arr, item):void {
        arr.splice( $.inArray(item, arr), 1 );
    }
    
    export function strcmp(a:string, b:string):number{
        if(a==b) return 0;
        if(a>b) return 1;
        return -1;
    }

    export function distinct<T>(arr:T[], f:(x:T)=>string):string[]{
        var r:string[] = [];
        var u:any = {};

        for(var i=0;i<arr.length;++i){
            var v = f(arr[i]);
            if(!u[v]){
                u[v] = true;
                r.push(v);
            }
        }
        return r;
    }

    //interprets the string as a space-separated list to be anded together
    export function matchField(s:string, f:bjs.field, extendedMatch:boolean):boolean {

        if(s.length < 1)
            return false;

        var terms = s.split(" ");

        for(var i=0;i<terms.length;++i){
            if(!matchSingleTerm(terms[i], f, extendedMatch))
                return false;
        }

        return true;
    }

    function matchSingleTerm(s:string, f:bjs.field, extendedMatch:boolean):boolean{

        if(s.length < 1)
            return false;

        var reg = new RegExp(s, 'i');
        if(reg.exec(f.fullname) != null){
            return true;
        }

        if(extendedMatch == false)
            return false;

        if(f.term != null && reg.exec(f.term.name) != null){
            return true;
        }

        if(reg.exec(f.asset.type) != null){
            return true;
        }

        if(reg.exec(f.asset.owner) != null){
            return true;
        }

        if(reg.exec(f.asset.dept) != null){
            return true;
        }

        if(reg.exec(f.flags) != null){
            return true;
        }

        return false;
    }

    export function getComplexity(f:bjs.field):number{
        return Object.keys(f.ancestors).length + f.sources.length;
    }
    
    export function getInfluence(f:bjs.field):number{
        var total=0;
        
        for(var afn in f.descendants){
            total+=(1/f.descendants[afn].depth);
        }
        
        return total;
    }
    
    export function getFilters(f:bjs.field):number{
        
        var total=0;
        
        for(var afn in f.descendants){
            if(f.descendants[afn].filt==true) 
                total+=(1/f.descendants[afn].depth);
        }
        
        return total;
    }
    
    export function getDependencies(f:bjs.field):number{
        
        var total=0;
        var utotal=0;
        
        for(var afn in f.ancestors){
            total++;
            if(f.ancestors[afn].ult) 
                utotal++;
        }
        
        return utotal;
    }
    
    export function getNameFirstPart(s:string):string{
        var a = s.split(".");
        if(a.length < 2){
            if(s.length > 7){
                return s.substr(0,7);
            } else {
                return s;
            }
        }
        
        if(a.length == 2){
            return a[0];
        }
        
        return a[0] + "." + a[1];
    }

    export function getBlock(a:bjs.asset, o:bjs.blockplan):string {

        switch(o){
            case bjs.blockplan.none:
            return "";
            case bjs.blockplan.dept:
            return a.dept;
            case bjs.blockplan.cat:
            return getNameFirstPart(a.fullname);
            case bjs.blockplan.owner:
            return a.owner;
            case bjs.blockplan.type:
            return a.type;
            default:
            return "";
        }

    }

}
