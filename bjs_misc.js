//logging, cloning etc.

var bjs;
(function(bjs) {

	var conf = {};

	bjs.lg_inf = function(s) {
		console.log("I: " + s);
	};
	bjs.lg_sum = function(s) {
		console.log("S: " + s);
	};
	bjs.lg_warn = function(s) {
		console.log("W: " + s);
	};
	bjs.lg_err = function(s) {
		console.log("E: " + s);
	};

	bjs.hover = function(o) {};



	bjs.fastrandom = function() {

		var fr = {};

		fr.cache = [];
		fr.idx = 0;

		for (var i = 0; i < 1000; ++i) {
			fr.cache[i] = Math.random();
		}

		fr.next = function(n) {
			fr.idx++;
			if (fr.idx >= fr.cache.length) fr.idx = 0;

			return Math.floor(fr.cache[fr.idx] * n);
		}

		return fr;
	}


})(bjs || (bjs = {}));
