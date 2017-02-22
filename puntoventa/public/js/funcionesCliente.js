var empresas = ["http://localhost:8080","http://localhost:8081","http://localhost:8082"];

var grafoTramos = new graphlib.Graph(); //crea un graph
var paths = [];


function buscar() {
  var paramOrigen = document.getElementById("origen");
  var paramDestino = document.getElementById("destino");
  
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
        generarTramos(cOrigen,cDestino,tramos,this.serverUrl);
      }
    };
    xhttp.open("GET", serverUrl+"/list", true);
    xhttp.send();
  }
}

function generarTramos(cOrigen,cDestino,tramos,serverUrl) {
  paths = [];
  addGrafo(tramos,serverUrl);
  allTramosGrafo(grafoTramos,cOrigen,cDestino,[cOrigen]);
  TramoTable(paths);
}

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

function reservar(path){
  for(var i=0; i < path.length-1; i++) {
    var tramo = grafoTramos.edge({ v: path[i], w: path[i+1] });
    console.log(tramo);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log("RESERVA PASAJE: " + this.responseText);
        alert("RESERVA PASAJE: " + this.responseText);
        javascript:location.reload();
      }
    };
    xhttp.open("POST", tramo.providerUrl +"/reservar", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(tramo));
    }
}

function TramoTable(paths){
    var tableDiv = document.getElementById("table");
    while(tableDiv.firstChild){
        tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.style.width = "500px";

    for (var i=0; i<paths.length; i++){
        var tr = document.createElement('TR');

        var path = paths[i];
        var table = document.createElement('TABLE');
        table.border='1';

        var tableCaption = document.createElement('CAPTION');
        tableCaption.appendChild(document.createTextNode("Opción "+(i+1)));
        table.appendChild(tableCaption);

        var tableBody = document.createElement('TBODY');
        table.appendChild(tableBody);

        var td = document.createElement('TD');
        td.width='1000';
        td.appendChild(table);
        for (var j=0; j<path.length-1; j++){
            var tramoTr = document.createElement('TR');
            tableBody.appendChild(tramoTr);
            var origenTd = document.createElement('TD');
            var destinoTd = document.createElement('TD');
            origenTd.style.paddingTop='10px';
            origenTd.width='100';
            origenTd.appendChild(document.createTextNode(path[j]));
            destinoTd.style.paddingTop='10px';
            destinoTd.width='100';
            destinoTd.appendChild(document.createTextNode(path[j+1]));
            tramoTr.appendChild(origenTd);
            tramoTr.appendChild(destinoTd);
        }
        tr.appendChild(td);
        tableDiv.appendChild(table);
        var botonReserva = document.createElement('BUTTON');
        botonReserva.appendChild(document.createTextNode('Reservar'));
        botonReserva.style.float='right';
        botonReserva.travel = path;
        botonReserva.onclick = function(){
            reservar(this.travel);
        };
        tr.appendChild(td);
        tableDiv.appendChild(table);
        tableDiv.appendChild(botonReserva);
        tableDiv.appendChild(document.createElement('BR'));
        tableDiv.appendChild(document.createElement('BR'));
    }

}

function completarReserva() {
    var i = document.getElementById("reserva").selectedIndex;
    console.log("Obtener las reservas "+document.getElementsByTagName("option")[i].value);
    var reserv = document.getElementsByTagName("option")[i].value;
    reserv = reserv.split(" - ");
    //console.log("Primera parte "+reserv[0]+" segunda parte "+reserv[1]);
    for (var i=0; i < empresas.length; i++) {
        var serverUrl = empresas[i];
        var xhttp = new XMLHttpRequest();
        xhttp.serverUrl = serverUrl;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Reserva Completa: "+ this.responseText);
                alert("Reserva Completa: "+ this.responseText);
                javascript:location.reload();
            }
        };
        xhttp.open("POST", serverUrl+"/completarreservas", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({idres:reserv[0]}));
    }
}

function cancelarReserva() {
    var i = document.getElementById("reserva").selectedIndex;
    console.log("Obtener las reservas "+document.getElementsByTagName("option")[i].value);
    var reserv = document.getElementsByTagName("option")[i].value;
    reserv = reserv.split(" - ");
    //console.log("Primera parte "+reserv[0]+" segunda parte "+reserv[1]);
    for (var i=0; i < empresas.length; i++) {
        var serverUrl = empresas[i];
        var xhttp = new XMLHttpRequest();
        xhttp.serverUrl = serverUrl;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Reserva Cancelada: "+ this.responseText);
                alert("Reserva Cancelada: "+ this.responseText);
                javascript:location.reload();
            }
        };
        xhttp.open("POST", serverUrl+"/cancelarreservas", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({idres:reserv[0]}));
    }
}