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
    
    export function removeItem(arr, item) {
        arr.splice( $.inArray(item, arr), 1 );
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

    export function matchField(s:string, f:bjs.field, extendedMatch:boolean):boolean {

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


}
