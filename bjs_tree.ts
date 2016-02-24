/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

	export class tree_view implements view {

	NODE_R = 8;
	TOTAL_HEIGHT = 1000; //x and y are flipped for trees.
	X_OFFSET = 320; //to account for hidden leftmost node
	TOTAL_WIDTH = 1000 + this.X_OFFSET;
	TOP_MARGIN = 20;
	CART_WIDTH = 160;
	CART_HEIGHT = 34;
	CART_FLAT_HEIGHT = this.CART_HEIGHT - 10;
	color = d3.scale.category20();

	//private state vars.  we need these becuase this view re-renders itself on a click.
	cached_svg = {};
	cached_dat : bjs.mv = null;
	cached_conf = {};


	
	//most of the render function can be called internally based on a tree node click, so the actual tree_view.render()
	//just prepares the mv for the first time; the mv will be edited in place as tree nodes change status.
	public render(svg, w:bjs.world, c):void {
		this.cached_svg = svg;
		this.cached_conf = c;
		
		var mv = this.prepareData(w);

		this.cached_dat = mv;

		this.doRender(svg, mv, c);
	}

	private doRender(svg, mv:bjs.mv, c):void{

		var tree = d3.layout.tree().size([this.TOTAL_HEIGHT, this.TOTAL_WIDTH]);

		var nodes = tree.nodes(mv.syntharoot);
		var links = tree.links(nodes);

		var duration = 500;

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

		this.drawNode(nodeEnter, c);
		
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
			.attr("stroke", "grey")
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
		mv.syntharoot.y0 = this.TOTAL_HEIGHT / 2;

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
	private drawNode(ne, c):void {
		
		var color = this.color;

		ne.append("rect")
			.attr("x", 0)
			.attr("y", -this.CART_HEIGHT / 2)
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("class", "cartouche")
			.attr("width", this.CART_WIDTH)
			.attr("height", this.CART_HEIGHT);

		ne.append("circle")
			.attr("r", this.NODE_R)
			.attr("class", "node")
			.style("fill", function(d) {
				return bjs.getNodeColor(color, c, d);
			});


		ne.append("text").filter(function(d) {
				return (d._children != null && d._children.length > 0) || (d.children != null && d.children.length > 0);
			})
			.attr("x", this.CART_WIDTH - this.NODE_R * 2)
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

		this.doRender(this.cached_svg, this.cached_dat, this.cached_conf);
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

	private mouseOut() {
		bjs.hover(null);
	}

}

}