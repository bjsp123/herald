//basic types

var bjs;
(function(bjs) {

	bjs.term = term;
	bjs.asset = asset;
	bjs.field = field;
	bjs.rel = rel;
	bjs.arel = arel;
	bjs.link = link;
	bjs.node = node;
	bjs.group = group;
	bjs.glink = glink;
	bjs.world = world;
	bjs.mv = mv;

	function term(code, name, desc, flags) {
		if (code == null || code == "") throw "Tried to create term with no code";
		this.itemtype = "term";
		this.name = name;
		this.code = code;
		this.flags = flags;
		this.fullname = code + " : " + name;

		this.children = [];
	}

	function asset(name, location, type, owner, desc, calc) {
		if (name == null || name == "") throw "Tried to create unnamed asset";
		this.itemtype = "asset";
		this.name = name;
		this.fullname = name;
		this.location = location;
		this.type = type;

		this.owner = owner;
		this.desc = desc;
		this.calc = calc;


		this.rels = [];
		this.peers = [];
		this.sources = [];
		this.targets = [];
		this.children = [];
		this.hasTargets = false;
		this.hasSources = false;
	}

	function field(fullname, name, asset, term, desc, formula) {
		if (name == null || name == "") throw "Tried to create unnamed field";
		if (asset == null) throw "Tried to create field " + name + " with no asset.";
		this.itemtype = "field";
		this.fullname = fullname;
		this.name = name;
		this.asset = asset;
		this.flags = "";
		this.term = term;

		this.rels = [];
		this.peers = [];
		this.sources = [];
		this.targets = [];
		this.ancestors = {};
		this.descendants = {};
		this.ldepth = -1;
		this.rdepth = -1;
		this.usources = {};
		this.utargets = {};
		this.hasTargets = false;
		this.hasSources = false;
	}

	function rel(source, target, type) {
		if (source == null) throw "Tried to create link with null source";
		if (target == null) throw "Tried to create link with null target";
		this.itemtype = "rel";
		this.source = source;
		this.target = target;
		this.type = type;
	}

	function arel(source, target) {
		if (source == null) throw "Tried to create group link with null source";
		if (target == null) throw "Tried to create group link with null target";
		this.itemtype = "arel";
		this.source = source;
		this.target = target;
		this.count = 0;
	}

	function node(field) {
		if (field == null) throw "Tried to create node without field";
		if (field.itemtype != "field") throw "Tried to create node with something that is not a field";
		this.itemtype = "node";
		this.field = field;
		this.fullname = field.fullname;
		this.group = null;

		this.x = -1;
		this.y = -1;
	}

	function link(source, target, rel) {
		if (source == null) throw "Tried to create link with null source";
		if (target == null) throw "Tried to create link with null target";
		if (rel == null) throw "Tried to create link with null rel";
		this.itemtype = "link";
		this.source = source;
		this.target = target;
		this.rel = rel;
	}

	function group(asset) {
		this.asset = asset;
		this.fullname = asset ? asset.fullname : "anon";
		this.itemtype = "group";
		this.children = [];
	}

	function glink(source, target, size) {
		this.itemtype = "glink";
		this.source = source;
		this.target = target;
		tihs.size = size;
	}

	function world() {
		this.assets = {};
		this.rels = [];
		this.terms = {};
		this.fields = {};
		this.fielda = [];
		this.arels = {};
		this.arela = [];
	}

	function mv(w) {
		this.world = w;
		this.nodea = [];
		this.nodes = {};
		this.links = [];
		this.groups = {};
		this.groupa = [];
	}


})(bjs || (bjs = {}));
