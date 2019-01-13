
/*
  Functions for connecting to dev solidatus server.

 */

var solidatus_adapter_token = "";

function connectSolidatus(url, user, pwd, callbackModelList){

    $("#span_connection_status").text("Connecting...");

    fetch(url + "/connect/token", {
        mode:"cors",
        method:"POST",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "username=" + user + "&password=" + pwd + "&client_id=ro.client&client_secret=ro.client&grant_type=password&scope=api1"
    })
        .then(resp => resp.json())
        .then(function(data) {

            solidatus_adapter_token = data["access_token"];
            console.log("Obtained Solidatus token " + solidatus_adapter_token);

            $("#span_connection_status").text("Connected");

            if(callbackModelList){
                fetchSolidatusModelList(callbackModelList);
            }
        })
        .catch(function(error) {
            console.log('Unable to connect to Solidatus server: ', error);
            alert("Unable to connect to Solidatus server:\n" + error);

            $("#span_connection_status").text("Connection Failed");
        });
}

function fetchSolidatusModelList(callbackModelList){

    var url = $("#ctrl_url").val().trim();

    fetch(url +  "/api/v1/models", {
        headers:{
            "Authorization": "Bearer " + solidatus_adapter_token
        }
    })
        .then(function(resp){
            if(!resp.ok){
                console.log("Error downloading model list: " + resp.error + " " + resp.status);
                alert("Unable to download Solidatus model list:\n" + resp.error + " " + resp.status);
            }
            return resp.json();
        })
        .then(function(data){
            if(!data){
                console.log("No model list retrieved");
                return;
            }else{
                console.log("Retrieved model list");
            }

            solidatusModels = data.items;

            var opts = [];

            for(var i=0; i < solidatusModels.length;++i){
                opts.push({value:solidatusModels[i].id, text:solidatusModels[i].name});
            }

            callbackModelList(opts);

        })
        .catch(function(error) {
            console.log('Unable to load Solidatus model list: \n', error);
        });

}

function fetchSolidatusWorld(modelId, callbackSolidatusWorld) {

    var url = $("#ctrl_url").val().trim();

    if(!solidatus_adapter_token){
        alert("Not connected to Solidatus");
    }

    if(!modelId){
        alert("No Solidatus model selected.");
        return;
    }


    fetch(url +  "/api/v1/models/" + modelId + "/load", {
        headers:{
            "Authorization": "Bearer " + solidatus_adapter_token
        }
    })
        .then(function(resp){
            if(!resp.ok){
                console.log("Error downloading model: " + resp.error + " " + resp.status);
                alert("Unable to download Solidatus model: " + resp.error + " " + resp.status);
            }

            return resp.json()
        })
        .then(function(data){

            if(!data){
                console.log("No model retrieved");
                return;
            }else{
                console.log("Retrieved model: " + data.model.name);
            }

            callbackSolidatusWorld(data.data);

        })
        .catch(function(error) {
            console.log('Unable to load Solidatus model: \n', error);
        });

}