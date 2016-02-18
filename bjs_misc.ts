//logging, cloning etc.

namespace bjs{

	export var conf = {};

	export function lg_inf(s) {
		//console.log("I: " + s);
	};
	export function lg_sum(s) {
		console.log("S: " + s);
	};
	export function g_warn(s) {
		console.log("W: " + s);
	};
	export function g_err(s) {
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


}
