

//logging, cloning etc.

var bjs;
(function (bjs) {

	bjs.lg_inf = function(s){console.log("I: "+s);};
	bjs.lg_sum = function(s){console.log("S: "+s);};
	bjs.lg_warn = function(s){console.log("W: "+s);};
	bjs.lg_err = function(s){console.log("E: "+s);};


})(bjs || (bjs = {}));
