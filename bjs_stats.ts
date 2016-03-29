/// <reference path="bjs_types.ts"/>
/// <reference path="bjs_viewutils.ts"/>
/// <reference path="bjs_layout.ts"/>
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
    axis:any[]=[];
    scale:any[]=[];

    scales:any[]=[];


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

      this.axis[0] = d3.svg.axis().scale(this.scale[0]).orient("left").innerTickSize(20);
      this.axis[1] = d3.svg.axis().scale(this.scale[1]).orient("left").innerTickSize(20);
      this.axis[2] = d3.svg.axis().scale(this.scale[2]).orient("left").innerTickSize(20);

      this.renderAxes(svg);

      this.renderChain(this.svg, this.config, "left", mv.lnodea, this.axis_x[0], true);
      this.renderChain(this.svg, this.config, "m1", mv.m1nodea, this.axis_x[1], true);
      this.renderChain(this.svg, this.config, "m2", mv.m2nodea, this.axis_x[2], true);
      this.renderChain(this.svg, this.config, "right", mv.rnodea, this.axis_x[3], true);

      this.renderGroups(svg, c, "groups", mv.groups);

      this.renderLinks(this.svg, mv);
    }

    private prepareData(w:bjs.world, c:bjs.config):bjs.mv{

      var mv = bjs.makeStats(this, w);
      var focus = this.focus;

      //now we'd better sort the 4 columns so they are stable when arranged into categories.

      mv.rnodea.sort(firstBy("fullname"));
      mv.lnodea.sort(firstBy("fullname"));
      mv.m1nodea.sort(firstBy("fullname"));
      mv.m2nodea.sort(firstBy("fullname"));

      
      this.scale[0] = bjs.makeScale(mv.lnodea, c.xorder, this.dims.top_edge, this.dims.bottom_edge);
      this.scale[1] = bjs.makeScale(mv.m1nodea, c.yorder, this.dims.top_edge, this.dims.bottom_edge);
      this.scale[2] = bjs.makeScale(mv.m2nodea, c.zorder, this.dims.top_edge, this.dims.bottom_edge);

      mv.rnodea.sort(firstBy("fullname"));
      this.positionAndMergeNodes(mv.lnodea, "axis_l", this.axis_x[0], bjs.handed.none, c.xorder, this.scale[0]);
      this.positionAndMergeNodes(mv.m1nodea, "axis_m1", this.axis_x[1], bjs.handed.none, c.yorder, this.scale[1]);
      this.positionAndMergeNodes(mv.m2nodea, "axis_m2", this.axis_x[2], bjs.handed.none, c.zorder, this.scale[2]);


      bjs.chainLayout(mv.rnodea, mv.groupa, this.axis_x[3], bjs.handed.right, true, this.dims.top_edge, this.dims.bottom_edge, this.dims.node_r, this.dims.groupbar_offs);

      return mv;

    }

    private positionAndMergeNodes(nodes:bjs.node[], tag:string, x:number, h:bjs.handed, o:bjs.xyorder, scale:any):void{

      var full = {};

      //give them all x and y coords
      //if two have the same coords, create a logical node for that location.
      for(var i=0;i<nodes.length; ++i){
        var d = nodes[i];
        d.handed = h;
        d.x = x;
        d.fullname += " " + tag;
        d.y = bjs.getNodePos(d, o, this.focus, scale);
        if(isNaN(d.x))d.x = 0;
        if(isNaN(d.y))d.y = 0;
        var loc = d.x + ", " + d.y;
        while(full[loc]){
          d.y += this.dims.node_r*0.5;
          loc = d.x + ", " + d.y;
        }
        full[loc] = d;
      }
    }


    private renderGroups(svg, conf, tag:string, data:bjs.IMap<group>) {

      var datarray = [];

      for (var y in data) {
        datarray.push(data[y]);
      }

      var groups = svg.selectAll(".group." + tag)
        .data(datarray, function(d, i) {
          return d.fullname;
        });

      var groupsg = groups
        .enter()
        .append("g")
        .style("opacity", 0)
        .attr("class", "group " + tag)
          .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", this.groupMouseOver)
        .on("mouseout", this.mouseOut);
        
      bjs.drawGroupBar(groups, groupsg, this.config);
      
      var groupupdate = groups
        .transition()
        .style("opacity", 1)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        

      var groupexit = groups.exit().transition(800).style("opacity", 0).remove();

    }


    private renderAxes(svg:any):void{
      var xax = svg.selectAll(".laxis").data([1]);
      var axis_x = this.axis_x;

      xax  
        .enter()
        .append("g")
        .append("text")
          .attr("class", "biglabel")
          .attr("x", 0)
          .attr("y", 44)
          .attr("text-anchor", "middle");

      xax
        .attr("class", "laxis")
          .attr("transform", "translate("+ (axis_x[0] - 90) + "," + 0 + ")")
          .call(this.axis[0]);

      xax
        .select(".biglabel")
        .text(bjs.getAxisLabel(this.config.xorder));


      var yax = svg.selectAll(".m1axis").data([1]);

      yax  
        .enter()
        .append("g")
        .append("text")
          .attr("class", "biglabel")
          .attr("x", 0)
          .attr("y", 44)
          .attr("text-anchor", "middle");

      yax
        .attr("class", "m1axis")
          .attr("transform", "translate("+ (axis_x[1] - 0) + "," + 0 + ")")
          .call(this.axis[1]);

      yax
        .select(".biglabel")
        .text(bjs.getAxisLabel(this.config.yorder));

     var zax = svg.selectAll(".m2axis").data([1]);

      zax  
        .enter()
        .append("g")
        .append("text")
          .attr("class", "biglabel")
          .attr("x", 0)
          .attr("y", 44)
          .attr("text-anchor", "middle");

      zax
        .attr("class", "m2axis")
          .attr("transform", "translate("+ (axis_x[2] - 0) + "," + 0 + ")")
          .call(this.axis[2]);

      zax
        .select(".biglabel")
        .text(bjs.getAxisLabel(this.config.zorder));



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



    private renderChain(svg, conf:bjs.config, tag:string, data:bjs.node[], x:number, drawAxis:boolean):void {
    

      if(drawAxis){
        var axis = svg.selectAll(".axis." + tag)
          .data([1]).enter()
          .append("line")
          .attr("class", "axis " + tag)
          .attr("x1", x)
          .attr("y1", this.dims.top_edge)
          .attr("x2", x)
          .attr("y2", this.dims.bottom_edge);
        }

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
          return p.group.fullname == d.fullname;
        })
        .classed("passive", function(p) {
          return p.group.fullname != d.fullname;
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
    
      var config = d.view.config;
      var o:bjs.xyorder = bjs.xyorder.asset;
      
      if(d.fullname.endsWith("axis_l")) o = config.xorder;
      if(d.fullname.endsWith("axis_m1")) o = config.yorder;
      if(d.fullname.endsWith("axis_m2")) o = config.zorder;
      
      
      d.view.svg.selectAll(".link")
        .classed("active", function(p) {
          return bjs.sortFunction(o, d.view.focus, d, p.source) ==0;
        })
        .classed("passive", function(p) {
          return bjs.sortFunction(o, d.view.focus, d, p.source) !=0;
        });

      d.view.svg.selectAll(".node")
        .classed("active", function(p) {
          return bjs.sortFunction(o, d.view.focus, d, p) ==0;
        })
        .classed("passive", function(p) {
          return bjs.sortFunction(o, d.view.focus, d, p) !=0;
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
