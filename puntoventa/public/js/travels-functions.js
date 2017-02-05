var enterpriseServers = ["http://localhost:8081","http://localhost:8082"];

var travels = new graphlib.Graph(); // creates a graph
var paths = [];

// Timestamp for event synchronization
var time_stamp=0;

/**
 * searchTravels(): this function call to all the enterprise servers seaching for travels. And then each 
 * time that get the response of a server it tries to calculate if there is a possible way from the origin 
 * to the destiny.
 */
function searchTravels() {
  var originSelect = document.getElementById("origin");
  var destinySelect = document.getElementById("destiny");
  
  var originCity = originSelect.options[originSelect.value].text;
  var destinyCity = destinySelect.options[destinySelect.value].text;
  
  console.log('Searching from '+originCity+' to '+destinyCity);

  for (var i=0; i < enterpriseServers.length; i++) {
    var serverUrl = enterpriseServers[i];

    var xhttp = new XMLHttpRequest();
    xhttp.serverUrl = serverUrl;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var jsonTravels = JSON.parse(this.responseText);
        findTravels(originCity,destinyCity,jsonTravels,this.serverUrl);
      }
    };
    xhttp.open("GET", serverUrl+"/list", true);
    xhttp.send();
  }
}

/**
 * findTravels(originCity,destinyCity,jsonTravels,serverUrl): this function calculates all the possible ways
 * to go from the originCity to the destinyCity according the current travels information and the given
 * in jsonTravels.
 */
function findTravels(originCity,destinyCity,jsonTravels,serverUrl) {
  saveTravels(jsonTravels,serverUrl);
  paths = [];
  findAllPaths(travels,originCity,destinyCity,[originCity]);
  fillTravelsTable(paths);
}

/**
 * saveTravels(originCity,destinyCity,jsonTravels): this function saves the given travels to the travels graph.
 */
function saveTravels(jsonTravels,serverUrl) {
  var i;
  for(i = 0; i < jsonTravels.length; i++) {
    var travel = jsonTravels[i];
    travel.providerUrl = serverUrl; 
    if (!travels.hasNode(travel.originCity))
      travels.setNode(travel.originCity);
    if (!travels.hasNode(travel.destinyCity))
      travels.setNode(travel.destinyCity);
    travels.setEdge(travel.originCity,travel.destinyCity,travel);
  }
}

/**
 * reserveTravels(path): reserve the travels in the given path.
 */
function reserveTravels(path){
  for(var i=0; i < path.length-1; i++) {
    var travelInPath = travels.edge({ v: path[i], w: path[i+1] });
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log("RESERVATION RESPONSE");
        console.log(this.responseText);
      }
    };
    xhttp.open("POST", travelInPath.providerUrl +"/reservation", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    time_stamp++;
    xhttp.send(JSON.stringify({travelId:travelInPath.id, time_stamp:time_stamp}));
  }
}