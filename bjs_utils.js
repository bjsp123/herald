
function findInArray(arr, f){
	for(var i=0;i<arr.length;++i){
		if(f(arr[i])){
			return arr[i];
		}
	}
	return null;
}

function findAllInArray(arr, f){
	var r = [];
	for(var i=0;i<arr.length;++i){
		if(f(arr[i])){
			r.push(arr[i]);
		}
	}
	return r;
}


function shortenString(str, len) {
	if (str.length <= len) return str;

	var bit = len/2-1;

	return str.substring(0, bit) + "..." + str.substring(str.length-bit, str.length);
}


function isEmptyObject(object) {
	for(var i in object) { return false; } 
		return true; 
}

// a clone function that copies properties across shallowly.
function clone(object){
	var r = {};
	for(f in object){
		r[f] = object[f];
	}
	return r;
}


// each parameter is a chain of regexes separates by spaces (if the regexes contain spaces, nothing will work)
// regexes in a parameter are or-ed
function applyQuery(n, inc, exc, inc_rels, exc_rels, only_crit) {

	var clauses;

    if(only_crit){
    	if(n.critical != "Critical")
    		return false;
    }

	if(inc.trim() != ""){
		clauses = inc.trim().split(" ");

		var selected = false;

		for (var i=0; i < clauses.length; ++i) {
			var clause = clauses[i];
			if(clause == "")continue;
			var reg = new RegExp(clause, 'i');
			if(reg.exec(n.fullname) != null){
				selected = true;
			}
		}

		if(!selected) return false;
	}

	clauses = exc.trim().split(" ");

	for (var i=0; i < clauses.length; ++i) {
		var clause = clauses[i];
		if(clause == "")continue;
		var reg = new RegExp(clause, 'i');
		if(reg.exec(n.fullname) != null){
			return false;
		}
	}


	clauses = exc_rels.trim().split(" ");

	for (var i=0; i < clauses.length; ++i) {
		var clause = clauses[i];
		if(clause == "")continue;
		var reg = new RegExp(clause, 'i');

		for(var ancestorname in n.ancestors){
			if(reg.exec(ancestorname) != null){
				return false;
			}
		}

		for(var descendantname in n.descendants){
			if(reg.exec(descendantname) != null){
				return false;
			}
		}
	}

	if(inc_rels.trim() != ""){
		clauses = inc_rels.trim().split(" ");

		var selected = false;

		for (var i=0; i < clauses.length; ++i) {
			var clause = clauses[i];
			if(clause == "")continue;
			var reg = new RegExp(clause,'i');


			for(var ancestorname in n.ancestors){
				if(reg.exec(ancestorname) != null){
					selected=true;
				}
			}

			for(var descendantname in n.descendants){
				if(reg.exec(descendantname) != null){
					selected=true;
				}
			}
		}

		if(!selected) return false;
	}


	return true;
}

function fastrandom(){

	var fr = {};

	fr.cache = [];
	fr.idx = 0;

	for(var i=0; i < 1000; ++i){
		fr.cache[i]=Math.random();
	}

	fr.next = function(n){
		fr.idx++;
		if(fr.idx >= fr.cache.length) fr.idx = 0;

		return Math.floor(fr.cache[fr.idx] * n);
	}

	return fr;
}

//expects a data set that has lnodes and rnodes prepared.
//uses brute force
//score functions give higher value for worse sort
//brute force and ignorance.
function bilateralBipartiteSort(dat){

	if(dat.lnodes.length < 2 || dat.rnodes.length < 2)
		return;

	var fr = fastrandom();

	function swappem(nodes, a, b){
		var t = nodes[a];
		nodes[a] = nodes[b];
		nodes[b] = t;

		nodes[a].idx=a;
		nodes[b].idx=b;
	}

	function scorem(dat){
		var score = 0;
		for(var i=0; i< dat.links.length; ++i){
			linka = dat.links[i];
			for(var j=0; j < dat.links.length; ++j){
				linkb = dat.links[j];

				var alpos = linka.source.idx/dat.lnodes.length;
				var arpos = linka.target.idx/dat.rnodes.length;

				var blpos = linkb.source.idx/dat.lnodes.length;
				var brpos = linkb.target.idx/dat.rnodes.length;

				if((alpos > blpos) != (arpos > brpos)){
					score++;
				}
			}
		}
		return score;
	}

	for(var i=0; i< dat.lnodes.length; ++i){
		dat.lnodes[i].idx=i;
	}

	for(var i=0; i< dat.rnodes.length; ++i){
		dat.rnodes[i].idx=i;
	}

	var score=scorem(dat);

	var d = new Date();
	var t = d.getTime();

	for(var i=0; i<10000; ++i){
		if(new Date().getTime()-t > 5000) break;
		var l1,l2,r1,r2;
		l1 = Math.floor(fr.next(dat.lnodes.length));
		l2 = Math.floor(fr.next(dat.lnodes.length));
		r1 = Math.floor(fr.next(dat.rnodes.length));
		r2 = Math.floor(fr.next(dat.rnodes.length));

		swappem(dat.lnodes, l1, l2);
		swappem(dat.rnodes, r1, r2);

		var newscore = scorem(dat);

		if(newscore > score){
			swappem(dat.lnodes, l1, l2);
			swappem(dat.rnodes, r1, r2);
		}else{
			score = newscore;
		}
	}

}


//expects a data set that has lnodes and rnodes prepared.
//uses brute force
//leaves the rhs alone, only sorts the lhs
function unilateralBipartiteSort(dat){

	if(dat.lnodes.length < 2 || dat.rnodes.length < 2)
		return;

	var fr = fastrandom();

	function swappem(nodes, a, b){
		var t = nodes[a];
		nodes[a] = nodes[b];
		nodes[b] = t;

		nodes[a].idx=a;
		nodes[b].idx=b;
	}


	function scorem(dat){
		var score = 0;
		for(var i=0; i< dat.links.length; ++i){
			linka = dat.links[i];
			for(var j=0; j < dat.links.length; ++j){
				linkb = dat.links[j];

				var alpos = linka.source.idx/dat.lnodes.length;
				var arpos = linka.target.idx/dat.rnodes.length;

				var blpos = linkb.source.idx/dat.lnodes.length;
				var brpos = linkb.target.idx/dat.rnodes.length;

				if((alpos > blpos) != (arpos > brpos)){
					score++;
				}
			}
		}
		return score;
	}

	for(var i=0; i< dat.lnodes.length; ++i){
		dat.lnodes[i].idx=i;
	}

	for(var i=0; i< dat.rnodes.length; ++i){
		dat.rnodes[i].idx=i;
	}

	var score=scorem(dat);

	var d = new Date();
	var t = d.getTime();

	for(var i=0; i<10000; ++i){
		if(new Date().getTime()-t > 5000) break;
		var l1,l2,r1,r2;
		l1 = Math.floor(fr.next(dat.lnodes.length));
		l2 = Math.floor(fr.next(dat.lnodes.length));

		swappem(dat.lnodes, l1, l2);

		var newscore = scorem(dat);

		if(newscore > score){
			swappem(dat.lnodes, l1, l2);
		}else{
			score = newscore;
		}
	}

}
