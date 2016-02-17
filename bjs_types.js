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
	bjs.filter = filter;
	bjs.squash = squash;


/////////// core data model

	function term(code, name, desc, flags) {
		bjs.lg_inf("Creating term " + code);
		if (code == null || code == "") 
			throw "Tried to create term with no code";
		this.itemtype = "term";
		this.name = name;
		this.code = code;
		this.flags = flags;
		this.fullname = code;
		this.desc = desc;

		this.children = [];
	}

	function asset(name, location, type, owner, dept, desc, calc, notbefore, latency, risk, comment) {
		bjs.lg_inf("Creating asset " + name);
		if (name == null || name == "") 
			throw "Tried to create unnamed asset";
		this.itemtype = "asset";
		this.name = name;
		this.fullname = name;
		this.location = location;
		this.type = type;

		this.owner = owner||"";
		this.dept = dept||"";
		this.desc = desc||"";
		this.calc = calc||"";
		this.comment = comment||"";

		this.notbefore = notbefore||0;
		this.latency = latency||0;
		this.risk = risk||0;

		this.rels = [];
		this.peers = [];
		this.sources = [];
		this.targets = [];
		this.children = [];
		this.hasTargets = false;
		this.hasSources = false;

		this.effnotbefore = null;
		this.isLatestSrc = false;
	}

	function field(fullname, name, type, asset, term, desc, formula, flags, quality, risk, comment) {
		bjs.lg_inf("Creating field " + fullname);
		if (name == null || name == "") 
			throw "Tried to create unnamed field";
		if (asset == null) 
			throw "Tried to create field " + name + " with no asset.";
		this.itemtype = "field";
		this.fullname = fullname;
		this.name = name;
		this.asset = asset;
		this.flags = flags||"";
		this.term = term;
		this.desc = desc||"";
		this.formula = formula||"";
		this.comment = comment||"";
		this.fieldtype = type;

		this.quality = quality||1;
		this.risk = risk||1 + asset.risk;

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

		this.effrisk = null;
		this.effquality = null;
	}

	function rel(source, target, type) {
		if (source == null) 
			throw "Tried to create link with null source";
		if (target == null) 
			throw "Tried to create link with null target";
		this.itemtype = "rel";
		this.source = source;
		this.target = target;
		this.type = type;
	}

	function arel(source, target) {
		if (source == null) 
			throw "Tried to create group link with null source";
		if (target == null) 
			throw "Tried to create group link with null target";
		this.itemtype = "arel";
		this.source = source;
		this.target = target;
		this.count = 0;
	}
	
	function world() {
		bjs.lg_inf("Creating new world");
		this.assets = {};
		this.rels = [];
		this.terms = {};
		this.fields = {};
		this.fielda = [];
		this.arels = {};
		this.arela = [];
	}


//////////////////// view model

	function node(mv, field) {
		bjs.lg_inf("Creating node " + field.fullname);
		if (field == null) 
			throw "Tried to create node without field";
		if (field.itemtype != "field") 
			throw "Tried to create node with something that is not a field";
		this.itemtype = "node";
		this.field = field;
		this.fullname = field.fullname;
		this.group = null;
		this.mv = mv;

		this.x = -1;
		this.y = -1;
	}

	function link(source, target, rel) {
		if (source == null) 
			throw "Tried to create link with null source";
		if (target == null) 
			throw "Tried to create link with null target";
		if (rel == null) 
			throw "Tried to create link with null rel";
		this.itemtype = "link";
		this.source = source;
		this.target = target;
		this.rel = rel;
	}

	function group(asset) {
		bjs.lg_inf("Creating group " + asset.fullname);
		this.asset = asset;
		this.fullname = asset ? asset.fullname : "anon";
		this.itemtype = "group";
		this.children = [];
	}

	function glink(source, target, arel, size) {
		this.itemtype = "glink";
		this.source = source;
		this.target = target;
		this.size = arel?arel.count:size;
		this.arel = arel;
	}

	function mv(w) {
		bjs.lg_inf("Creating mv");
		this.world = w;
		this.nodea = [];
		this.nodes = {};
		this.links = [];
		this.glinks = [];
		this.groups = {};
		this.groupa = [];
		this.treeroots = [];
	}
	
	
	
/////////////// other

	function filter(inc, exc, inc_rels, exc_rels, only_crit, grab_left, grab_right) {
		this.inc = inc?inc.trim():"";
		this.exc = exc?exc.trim():"";
		this.inc_rels = inc_rels?inc_rels.trim():"";
		this.exc_rels = exc_rels?exc_rels.trim():"";
		this.only_crit = only_crit?true:false;
		this.grab_left = grab_left?true:false;
		this.grab_right = grab_right?true:false;
	}
	
	function squash(el_fields, el_assets, el_internals) {
		this.el_fields = el_fields?el_fields.trim():"";
		this.el_assets = el_assets?el_assets.trim():"";
		this.el_internals = el_internals?true:false;
	}


})(bjs || (bjs = {}));
