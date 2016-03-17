/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_data_json.ts"/>
/// <reference path="bjs_mv.ts"/>


declare var d3:any;
declare var ownerSVGElement:any;

namespace bjs {

  export class bp_stats implements view {
    
    svg:any = null;
    config:bjs.config=null;
    mv:bjs.mv=null;
    focus:bjs.filter=null;
    dims:bjs.dimensions=null;

    axis_x:number[] = [];


    public render(svg, w:bjs.world, c:bjs.config, f:bjs.filter, d:bjs.dimensions):void {
      
      this.svg = svg;
      this.config=c;
      this.focus = f;
      this.dims = d;

      this.axis_x[0] = this.dims.left_edge + 100;
      this.axis_x[3] = this.dims.right_edge - 100;
      this.axis_x[1] = this.axis_x[0] + (this.axis_x[3]-this.axis_x[0])*.33;
      this.axis_x[2] = this.axis_x[0] + (this.axis_x[3]-this.axis_x[0])*.66;

      var mv = this.prepareData(w, c);
      this.mv = mv;

      this.renderChain(this.svg, this.config, "left", mv.lnodea, this.axis_x[0]);
      this.renderChain(this.svg, this.config, "m1", mv.m1nodea, this.axis_x[1]);
      this.renderChain(this.svg, this.config, "m2", mv.m2nodea, this.axis_x[2]);
      this.renderChain(this.svg, this.config, "right", mv.rnodea, this.axis_x[3]);

      this.renderLinks(this.svg, mv);


    }

    private prepareData(w:bjs.world, c:bjs.config):bjs.mv{

      var mv = bjs.makeStats(this, w);
      var focus = this.focus;

      //now we'd better sort the 4 columns.

      mv.rnodea.sort(firstBy("fullname"));

      mv.lnodea.sort(firstBy(function(a,b){return (bjs_data_json.isMatch(a.field, focus)?1:-1) -  (bjs_data_json.isMatch(b.field, focus)?1:-1);}).thenBy("fullname"));
      mv.m1nodea.sort(firstBy(function(a,b){return a.field.effquality - b.field.effquality;}).thenBy("fullname"));
      mv.m2nodea.sort(firstBy(function(a,b){return a.field.effrisk - b.field.effquality;}).thenBy("fullname"));

      for(var i=0;i<mv.lnodea.length;++i) {mv.lnodea[i].x=this.axis_x[0]; mv.lnodea[i].handed = bjs.handed.left; mv.lnodea[i].fullname += " l";}
      for(var i=0;i<mv.m1nodea.length;++i) {mv.m1nodea[i].x=this.axis_x[1]; mv.m1nodea[i].handed = bjs.handed.left; mv.m1nodea[i].fullname += " m1";}
      for(var i=0;i<mv.m2nodea.length;++i) {mv.m2nodea[i].x=this.axis_x[2]; mv.m2nodea[i].handed = bjs.handed.right; mv.m2nodea[i].fullname += " m2";}
      for(var i=0;i<mv.rnodea.length;++i) {mv.rnodea[i].x=this.axis_x[3]; mv.rnodea[i].handed = bjs.handed.right; mv.rnodea[i].fullname += " r";}

      this.updateOffsValues(mv.lnodea, null, false, this.dims.top_edge, this.dims.bottom_edge);
      this.updateOffsValues(mv.m1nodea, null, false, this.dims.top_edge, this.dims.bottom_edge);
      this.updateOffsValues(mv.m2nodea, null, false, this.dims.top_edge, this.dims.bottom_edge);
      this.updateOffsValues(mv.rnodea, mv.groupa, true, this.dims.top_edge, this.dims.bottom_edge);

      return mv;

    }


    private renderLinks(svg:any, dat:bjs.mv):void {
      
      var bundle_offs = this.dims.bundle_offs;

      var links = svg.selectAll(".link")
        .data(dat.links, function(d, i) {
          if (d.target == null || d.source == null)
            return "";
          return d.source.fullname + d.target.fullname;

        });
        
      var config = this.config;
      var focus = this.focus;


      links
        .enter()
        .append("path")
        .attr("class", "link");


      links
          .transition()
          .attr("d", function(d) { return bjs.getLinkPath(d, bundle_offs, false, false);})
          .attr("stroke",  function(d){return bjs.getLinkColor(config, focus, d);});
      

      links
        .exit()
        .transition(800).style("opacity", 0)
        .remove();
    }



    private renderChain(svg, conf:bjs.config, tag:string, data:bjs.node[], x:number):void {
    

      var axis = svg.selectAll(".axis." + tag)
        .data([1]).enter()
        .append("line")
        .attr("class", "axis " + tag)
        .attr("x1", x)
        .attr("y1", this.dims.top_edge)
        .attr("x2", x)
        .attr("y2", this.dims.bottom_edge);

      var nodes = svg
        .selectAll(".nodegrp." + tag)
        .data(data, function(d) {
          return d.fullname;
        });

      var nodesg = nodes
        .enter()
        .append("g")
        .attr("class", "nodegrp " + tag)
        .style("opacity",0)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", this.nodeMouseOver)
        .on("mouseout", this.mouseOut);
        
      bjs.drawNodes(nodes, nodesg, this.config, this.focus, this.dims.node_r, true, (this.config.optimize && (x<400)));//approx way to decide whether to draw full name
      
      var nodeupdate = nodes
        .transition()
        .style("opacity",1)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      var nodeexit = nodes.exit().transition(800).style("opacity", 0).remove();

    }



    private updateOffsValues(nodes:bjs.node[], groups:bjs.group[], separateGroups:boolean, min:number, max:number):void {

      if (nodes.length == 0) return;

      var numRegularNodes = 0,
        numBreaks = 0;

      var prevgroup = nodes[0].group.fullname;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].group.fullname != prevgroup && separateGroups) {
          numBreaks += 1;
          prevgroup = nodes[i].group.fullname;
        }

        numRegularNodes++;
      }

      var interval = (max-min) / (numRegularNodes + (numBreaks));

      var offs = min - interval / 2;
      var prevgroup = nodes[0].group.fullname;
      for (var i = 0; i < nodes.length; i++) {

        offs += interval;

        if (nodes[i].group.fullname != prevgroup && separateGroups) {
          offs += interval;
          prevgroup = nodes[i].group.fullname;
        }
        nodes[i].y = offs;
      }

      if(groups != null){
        for (var j = 0; j < groups.length; ++j) {
          var p = groups[j];
          bjs.fitGroupToNodesBar(p, this.dims.node_r, this.dims.groupbar_offs);
        }
    }

    }


    private groupMouseOver(d) {
      d.view.svg.selectAll(".link")
        .classed("active", function(p) {
          return p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname;
        })
        .classed("passive", function(p) {
          return !(p.source.group.fullname == d.fullname || p.target.group.fullname == d.fullname);
        });

      d.view.svg.selectAll(".node")
        .classed("active", function(p) {
          return bjs.isNodeRelatedToGroup(p, d);
        })
        .classed("passive", function(p) {
          return !bjs.isNodeRelatedToGroup(p, d);
        });

      d.view.svg.selectAll(".group")
        .classed("active", function(p) {
          return p.fullname == d.fullname;
        })
        .classed("passive", function(p) {
          return p.fullname != d.fullname;
        });


      bjs.hover(d);
    }


    private nodeMouseOver(d) {
      
      d.view.svg.selectAll(".link")
        .classed("active", function(p) {
          return p.source.field.fullname == d.field.fullname;
        })
        .classed("passive", function(p) {
          return p.source.field.fullname != d.field.fullname ;
        });

      d.view.svg.selectAll(".node")
        .classed("active", function(p) {
          return p.field.fullname == d.field.fullname;
        })
        .classed("passive", function(p) {
          return p.field.fullname != d.field.fullname;
        });

      bjs.hover(d);
    }

    private mouseOut(d) {
      d.view.svg.selectAll(".passive").classed("passive", false);
      d.view.svg.selectAll(".active").classed("active", false);
      bjs.hover(null);
    }



  }

}
