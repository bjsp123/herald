var bjs;
(function(bjs) {

	bjs.shortenString = shortenString;


	function findInArray(arr, f) {
		for (var i = 0; i < arr.length; ++i) {
			if (f(arr[i])) {
				return arr[i];
			}
		}
		return null;
	}

	function findAllInArray(arr, f) {
		var r = [];
		for (var i = 0; i < arr.length; ++i) {
			if (f(arr[i])) {
				r.push(arr[i]);
			}
		}
		return r;
	}


	function shortenString(str, len) {
		if (str.length <= len) return str;

		var bit = len / 2 - 1;

		return str.substring(0, bit) + "..." + str.substring(str.length - bit, str.length);
	}


	function isEmptyObject(object) {
		for (var i in object) {
			return false;
		}
		return true;
	}

	// a clone function that copies properties across shallowly.
	function clone(object) {
		var r = {};
		for (f in object) {
			r[f] = object[f];
		}
		return r;
	}


	// each parameter is a chain of regexes separates by spaces (if the regexes contain spaces, nothing will work)
	// regexes in a parameter are or-ed
	function applyQuery(n, inc, exc, inc_rels, exc_rels, only_crit) {

		var clauses;

		if (only_crit) {
			if (n.critical != "Critical")
				return false;
		}

		if (inc.trim() != "") {
			clauses = inc.trim().split(" ");

			var selected = false;

			for (var i = 0; i < clauses.length; ++i) {
				var clause = clauses[i];
				if (clause == "") continue;
				var reg = new RegExp(clause, 'i');
				if (reg.exec(n.fullname) != null) {
					selected = true;
				}
			}

			if (!selected) return false;
		}

		clauses = exc.trim().split(" ");

		for (var i = 0; i < clauses.length; ++i) {
			var clause = clauses[i];
			if (clause == "") continue;
			var reg = new RegExp(clause, 'i');
			if (reg.exec(n.fullname) != null) {
				return false;
			}
		}


		clauses = exc_rels.trim().split(" ");

		for (var i = 0; i < clauses.length; ++i) {
			var clause = clauses[i];
			if (clause == "") continue;
			var reg = new RegExp(clause, 'i');

			for (var ancestorname in n.ancestors) {
				if (reg.exec(ancestorname) != null) {
					return false;
				}
			}

			for (var descendantname in n.descendants) {
				if (reg.exec(descendantname) != null) {
					return false;
				}
			}
		}

		if (inc_rels.trim() != "") {
			clauses = inc_rels.trim().split(" ");

			var selected = false;

			for (var i = 0; i < clauses.length; ++i) {
				var clause = clauses[i];
				if (clause == "") continue;
				var reg = new RegExp(clause, 'i');


				for (var ancestorname in n.ancestors) {
					if (reg.exec(ancestorname) != null) {
						selected = true;
					}
				}

				for (var descendantname in n.descendants) {
					if (reg.exec(descendantname) != null) {
						selected = true;
					}
				}
			}

			if (!selected) return false;
		}


		return true;
	}



})(bjs || (bjs = {}));