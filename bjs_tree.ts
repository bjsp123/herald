/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class tree_view implements view {

	
	X_OFFSET = -120; //to account for hidden leftmost node
	CART_WIDTH = 160;
	CART_HEIGHT = 34;
	CART_FLAT_HEIGHT = this.CART_HEIGHT - 10;

	svg: any = null;
	mv :bjs.mv = null;
	config: bjs.config = null;
	focus: bjs.filter=null;
	dims:bjs.dimensions=null;


	
	//most of the render function can be called internally based on a tree node click, so the actual tree_view.render()
	//just prepares the mv for the first time; the mv will be edited in place as tree nodes change status.
	public render(svg, w:bjs.world, c:config, f:filter, d:dimensions):void {
		this.svg = svg;
		this.config = c;
		this.focus = f;
		this.dims=d;
		
		var mv = this.prepareData(w);

		this.mv = mv;

		this.doRender(svg, mv, c, f);
	}

	private doRender(svg, mv:bjs.mv, c:config, f:filter):void{

		var tree = d3.layout.tree().size([this.dims.right_edge-this.dims.left_edge, this.dims.bottom_edge-this.dims.top_edge]);

		var nodes = tree.nodes(mv.syntharoot);
		var links = tree.links(nodes);
		
		//each link ought to be associated with the underlying rel
		for(var i=0; i < links.length; ++i){
			var l = links[i];
			for(var j=0; j < this.mv.world.rels.length; ++j){
				var r = this.mv.world.rels[j];
				if(r.target.fullname == l.source.fullname && r.source.fullname == l.target.fullname){
					l.rel = r;
				}
			}
		}

		var duration = this.dims.duration;
		
		var config = this.config;
		var focus = this.focus;

		nodes = nodes.filter(function(d) {
			return d.field!=null;
		});
		links = links.filter(function(d) {
			return d.source.field!=null;
		});

		//shift everything left to account for hidden root node
		nodes.forEach(function(d) {
			d.y -= this.X_OFFSET;
		}, this);


		var nt = svg.selectAll("g.nt")
			.data(nodes, function(d) {
				return d.nameintree;
			});

		var nodeEnter = nt.enter()
			.append("g")
			//.filter(function(d) { return !d.issyntharoot;})
			.attr("class", "nt")
			.attr("transform", function(d) {
				return "translate(" + d.parent.y0 + "," + d.parent.x0 + ")";
			})
			.style("fill-opacity", 1e-6)
			.style("stroke-opacity", 1e-6)
			.on("click", this.onNodeClick)
			.on("mouseover", this.nodeMouseOver)
			.on("mouseout", this.mouseOut);;

		this.drawNode(nodeEnter, c, f);
		
		var con:any = this.connector_cubic;//sigh
		var v:any = this; //good grief.

		var nodeUpdate = nt.transition()
			.duration(duration)
			.style("fill-opacity", 1)
			.style("stroke-opacity", 1)
			.attr("transform", function(d) {
				return "translate(" + (d.y) + "," + (d.x) + ")";
			});


		// Transition exiting nodes to the parent's new position.
		var nodeExit = nt.exit().transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + d.parent.y + "," + d.parent.x + ")";
			})
			.style("fill-opacity", 1e-6)
			.style("stroke-opacity", 1e-6)
			.remove();


		// Update the links…
		var tl = svg.selectAll("path.link")
			.data(links, function(d) {
				return d.target.nameintree;
			});
			
		// Enter any new links at the parent's previous position.
		tl.enter().insert("path", "g")
			//.filter(function(d) { return !d.source.issyntharoot && !d.target.issyntharoot;})
			.attr("class", "link")
			.attr("stroke", function(d){return bjs.getLinkColor(config, focus, d);})
			.style("stroke-opacity", 1e-6)
			.attr("d", function(d) {
				var o = {
					x: d.source.x0,
					y: d.source.y0,
					view: v
				};
				return con({
					source: o,
					target: o
				});
			});

		// Transition links to their new position.
		tl.transition()
			.duration(duration)
			.style("stroke-opacity", 1)
			.attr("d", con);

		// Transition exiting nodes to the parent's new position.
		tl.exit().transition()
			.duration(duration)
			.style("stroke-opacity", 1e-6)
			.attr("d", function(d) {
				var o = {
					x: d.source.x,
					y: d.source.y,
					view: v
				};
				return con({
					source: o,
					target: o
				});
			})
			.remove();

		// Stash the old positions for transition.
		
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		}, this);

	}
	
	private prepareData(w:bjs.world):bjs.mv {

		var mv = bjs.makeTree(this, w);

		mv.syntharoot.x0 = 0; //these values only exist to give a point from which new nodes will appear / old nodes will disappear
		mv.syntharoot.y0 = this.dims.bottom_edge / 2;

		mv.syntharoot.children.forEach(this.collapse, this);
		
		return mv;
	}

	private connector_elbow(d, i) {
		return "M" + (d.source.y + this.CART_WIDTH) + "," + d.source.x + "H" + ((d.source.y + this.CART_WIDTH) + d.target.y) * .5 + "V" + d.target.x + "H" + d.target.y;
	}

	private connector_cubic(d, i) {

		var xoffs = Math.abs(d.source.y - d.target.y) / 7;

		var yoffs = 0;

		if (d.source.children && d.source.children.length > 1) {
			for (var idx = 0; idx < d.source.children.length; ++idx) {
				if (d.source.children[idx].fullname == d.target.fullname) {
					yoffs = (idx / (d.source.children.length - 1)) *  d.source.view.CART_FLAT_HEIGHT -  d.source.view.CART_FLAT_HEIGHT / 2;
				}
			}
		}

		return "M " + (d.source.y + d.source.view.CART_WIDTH) + " " + (d.source.x + yoffs) + "C " + (d.source.y +  d.source.view.CART_WIDTH + xoffs) + " " + (d.source.x + yoffs) + " " + (d.target.y - xoffs) + " " + d.target.x + " " + d.target.y + " " + d.target.x;
	}

	//expects an entry selection with a xlated g appended to it
	private drawNode(ne, c:bjs.config, f:bjs.filter):void {

		ne.append("rect")
			.attr("x", 0)
			.attr("y", -this.CART_HEIGHT / 2)
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("class", "cartouche")
			.attr("width", this.CART_WIDTH)
			.attr("height", this.CART_HEIGHT);

		ne.append("circle")
			.attr("r", this.dims.node_r)
			.attr("class", "node")
			.style("fill", function(d) {
				return bjs.getNodeColor(c, f, d);
			});


		ne.append("text").filter(function(d) {
				return (d._children != null && d._children.length > 0) || (d.children != null && d.children.length > 0);
			})
			.attr("x", this.CART_WIDTH - this.dims.node_r * 2)
			.attr("y", 28 - this.CART_HEIGHT / 2)
			.attr("class", "nodelabel")
			.text(">>");

		ne.append("text")
			.attr("x", 12)
			.attr("y", 13 - this.CART_HEIGHT / 2)
			.attr("class", "nodelabel")
			.text(function(d) {
				return d.field.name;
			});

		ne.append("text")
			.attr("x", 12)
			.attr("y", 28 - this.CART_HEIGHT / 2)
			.attr("class", "nodelabel")
			.text(function(d) {
				return d.field.asset.fullname;
			});

	}

	// Toggle children on click.
	private onNodeClick(d) {
		d.view.innerOnClick(d);
	}
	
	public innerOnClick(d){

		if (d.children) {
			this.collapse(d);
		}
		else {
			this.expand(d);
		}

		this.doRender(this.svg, this.mv, this.config, this.focus);
	}

	private collapse(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		}

		if (d.children){
			for(var i =0; i < d.children.length; ++i){
				this.collapse(d.children[i]);
			}
		}
	}

	private expand(d) {
		if (d._children) {
			d.children = d._children;
			d._children = null;
		}

		if (d.children){
			for(var i =0; i < d.children.length; ++i){
				this.expand(d.children[i]);
			}
		}
	}


	private nodeMouseOver(d) {
		bjs.hover(d);
	}

	private mouseOut(d) {
		bjs.hover(null);
	}

}

}