var empresas = ["http://localhost:8080","http://localhost:8081","http://localhost:8082"];

var grafoTramos = new graphlib.Graph(); //crea un graph
var paths = [];


function buscar() {
  var paramOrigen = document.getElementById("origin");
  var paramDestino = document.getElementById("destiny");
  
  var cOrigen = paramOrigen.options[paramOrigen.value].text;
  var cDestino = paramDestino.options[paramDestino.value].text;
  
  console.log(cOrigen+' - '+cDestino);

  for (var i=0; i < empresas.length; i++) {
    var serverUrl = empresas[i];

    var xhttp = new XMLHttpRequest();
    xhttp.serverUrl = serverUrl;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var tramos = JSON.parse(this.responseText);
        findTravels(cOrigen,cDestino,tramos,this.serverUrl);
      }
    };
    xhttp.open("GET", serverUrl+"/list", true);
    xhttp.send();
  }
}

/**
 * findTravels(cOrigen,cDestino,jsonTravels,serverUrl): this function calculates all the possible ways
 * to go from the cOrigen to the cDestino according the current travels information and the given
 * in jsonTravels.
 */
function findTravels(cOrigen,cDestino,tramos,serverUrl) {
  addGrafo(tramos,serverUrl);
  paths = [];
  findAllPaths(grafoTramos,cOrigen,cDestino,[cOrigen]);
  addTramoTable(paths);
}

/**
 * saveTravels(cOrigen,cDestino,tramos): this function saves the given travels to the travels graph.
 */
function addGrafo(tramos,serverUrl) {
  var i;
  for(i = 0; i < tramos.length; i++) {
    var viaje = tramos[i];
    viaje.providerUrl = serverUrl; 
    if (!grafoTramos.hasNode(viaje.cOrigen)){
      grafoTramos.setNode(viaje.cOrigen);
    }
    if (!grafoTramos.hasNode(viaje.cDestino)){
      grafoTramos.setNode(viaje.cDestino);
    }
    grafoTramos.setEdge(viaje.cOrigen,viaje.cDestino,viaje);
  }
}

/**
 * reserveTravels(path): reserve the travels in the given path.
 */
function reservar(path){
  for(var i=0; i < path.length-1; i++) {
    var tramo = grafoTramos.edge({ v: path[i], w: path[i+1] });
    console.log(tramo);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log("RESERVA RESPONSE: " + this.responseText);
      }
    };
    xhttp.open("POST", tramo.providerUrl +"/reservar", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    //xhttp.send(JSON.stringify({tramoId:tramo.id}));
    xhttp.send(JSON.stringify(tramo));
    }
}

function addTramoTable(paths){
    var tableDiv = document.getElementById("table");
    while(tableDiv.firstChild){
        tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.style.width = "500px";

    for (var i=0; i<paths.length; i++){
        var pathTr = document.createElement('TR');

        var path = paths[i];
        var pathTable = document.createElement('TABLE');
        pathTable.border='1';

        var pathTableCaption = document.createElement('CAPTION');
        pathTableCaption.appendChild(document.createTextNode("Opción "+(i+1)));
        pathTable.appendChild(pathTableCaption);

        var pathTableBody = document.createElement('TBODY');
        pathTable.appendChild(pathTableBody);

        var pathTd = document.createElement('TD');
        pathTd.width='1000';
        pathTd.appendChild(pathTable);
        for (var j=0; j<path.length-1; j++){
            var travelTr = document.createElement('TR');
            pathTableBody.appendChild(travelTr);
            var origenTd = document.createElement('TD');
            var destinoTd = document.createElement('TD');
            origenTd.style.paddingTop='10px';
            origenTd.width='100';
            origenTd.appendChild(document.createTextNode(path[j]));
            destinoTd.style.paddingTop='10px';
            destinoTd.width='100';
            destinoTd.appendChild(document.createTextNode(path[j+1]));
            travelTr.appendChild(origenTd);
            travelTr.appendChild(destinoTd);
        }

        pathTr.appendChild(pathTd);
        tableDiv.appendChild(pathTable);
        var buttonReserva = document.createElement('BUTTON');
        buttonReserva.appendChild(document.createTextNode('Reservar'));
        buttonReserva.style.float='right';
        buttonReserva.travel = path;
        buttonReserva.onclick = function(){
            reservar(this.travel);
        };
        tableDiv.appendChild(buttonReserva);
        tableDiv.appendChild(document.createElement('BR'));
        tableDiv.appendChild(document.createElement('BR'));
    }

}