/// <reference path="bjs_types.ts"/>

declare var firstBy:any;

namespace bjs_data_solidatus {

	//for now, assume each layer contains a list of objects and each object a non-nested list of attributes

	//in solidatus, fields(attrs) have a unique ID -- we'll need to map from this to the asset:field fullname used in clarity
	var fieldMap:bjs.IMap<bjs.field> = {};

    export function loadSolidatusModel(json: any, theDate: Date): bjs.world {

        var w = new bjs.world();


        bjs.lg_sum("Reading new solidatus world.");

        var layers = json.layers||json.roots;

        for(var i=0; i < layers.length; ++i){
        	bjs.lg_sum("Processing layer " + layers[i]);
        	processLayer(json, layers[i], w);
		}

		for(var xid in json.transitions){
        	var xition = json.transitions[xid];
        	var src = fieldMap[xition.source];
        	var tgt = fieldMap[xition.target];

        	if(!src){
        		bjs.lg_err("Unable to find src field " + w.fields[xition.source]);
        		continue;
			}

            if(!tgt){
                bjs.lg_err("Unable to find tgt field " + w.fields[xition.target]);
                continue;
            }

            var x = new bjs.rel(src, tgt, "value");
        	w.rels.push(x);
		}

        return w;
    }

    function processLayer(json:any, layerId:string, w:bjs.world):void{

    	var layerRecord = json.entities[layerId];

    	if(!layerRecord){
    		bjs.lg_err("Layer record is missing: " + layerId);
    		return;
		}

		var objects = layerRecord.children;

    	for(var i=0; i < objects.length; ++i){
    		processObject(json, objects[i], layerRecord, w);
		}
	}

	function processObject(json:any, objectId:any, layerRecord:any, w:bjs.world):void{

    	var obj = json.entities[objectId];

    	if(!obj){
    		bjs.lg_err("Object record is missing: " + objectId);
    		return;
		}

		//an object is an Asset in Clarity terms.  We need to create an appropriate asset

		var groupprefix = obj.properties["Clarity.group"]||"S";
		var fullname = groupprefix + "." + objectId;
    	var name = obj.properties["Clarity.label"]||obj.name;


		var a = new bjs.asset(
			fullname,
			name,
			obj.properties["Clarity.location"]||"",
            obj.properties["Clarity.type"]||"",
            obj.properties["Clarity.owner"]||"",
            obj.properties["Clarity.department"]||"",
            obj.properties["Clarity.desc"]||"",
			obj.properties["Clarity.formula"]||"",
            parseFloat(obj.properties["Clarity.notbefore"]),
            parseFloat(obj.properties["Clarity.latency"]),
            parseFloat(obj.properties["Clarity.risk"]),
			1,
			"Loaded from Solidatus model.",
			layerRecord.name);

        w.assets[a.fullname] = a;

        for(var i=0; i< obj.children.length; ++i){
        	var fieldId = obj.children[i];

        	var attr = json.entities[fieldId];

        	if(!attr){
                bjs.lg_err("Attribute record is missing: " + fieldId);
                continue;
			}

			var fullfieldname = a.fullname + ":" + fieldId;
        	var name = attr.properties["Clarity.label"]?attr.properties["Clarity.label"]:attr.name;

			var f = new bjs.field(
				fullfieldname,
				name,
                attr.properties["Clarity.type"]||"",
				a,
				null,
                attr.properties["Clarity.desc"]||"",
                attr.properties["Clarity.formula"]||"",
                attr.properties["Clarity.flags"]||"",
                parseFloat(attr.properties["Clarity.quality"]),
                parseFloat(attr.properties["Clarity.risk"]),
                parseFloat(attr.properties["Clarity.importance"]),
				1,//this is available standard in Solidatus so we should be able to get it.
				1,
				"Loaded from Solidatus model.");


            w.fields[f.fullname] = f;
            w.fielda.push(f);
            if (f.asset) f.asset.children.push(f);

            fieldMap[fieldId] = f;
		}
	}
}