/* global LinkedList, javascript, graphlib */
function Node(data)
{
    this.next = null;
    this.data = data;
}

function LinkedList()
{
    this.length = 0;
    this.head = null;

    // add node with given value to the list.
    this.add = function (value)
    {
        var node = new Node(value);

        var temp;

        if(this.length === 0)
        {
            this.head = node;
            this.length++;
            return;
        }

        temp = this.head;

        // Move to the position where we can perform addition
        // This logic is slightly different when we for example need to do search.
        while(temp.next)
        {
            temp = temp.next;
        }

        temp.next = node;
        this.length++;

        return;

    };

    // Search for node with given value.
        this.search = function (value)
    {
        // index where the node was found
        var index = 0;

        // If the list is empty there is no point in searching.
        if(!this.head)
        {
            //console.log("List is empty");
            return null;

        }

        var temp = this.head;
        var i = 0;
        while(i<this.length)
        {
            if(i === value)
            {
                //console.log("Found at: "  + index);
                return temp;
            }

            // move to next node
            temp = temp.next;

            index++;
        }

        console.log("Node not found");

    };

    // Dump whole list
    this.print = function()
    {
        if(!this.head)
        {
            console.log("List is empty");
            return;

        }

        var temp = this.head;

        while(temp)
        {
            console.log(temp.data);
            temp = temp.next;
        }

    };

    // Remove node at index. Index starts from 0.
    this.removeAtIndex = function (index)
    {
        var i = 0;

        if(index < 0 || index >= this.length)
            throw "Wrong index";

        var temp = this.head;

        if(!this.head)
            return;

        if(index === 0)
        {
            this.head = this.head.next;
            this.length--;
            return;
        }

        // Move to the position where we can perform delete.
        for(i = 0; i < index  - 1; i++)
        {
            temp = temp.next;
        }

        temp.next = temp.next.next;
        this.length--;
        return;


    };
}

var empresas = ["http://localhost:8080","http://localhost:8081","http://localhost:8082"];

var grafoTramos = new graphlib.Graph(); //crea un graph
var paths = [];
var respList = new LinkedList();

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
            respList.add(JSON.parse(this.responseText));
            //alert("RESERVA PASAJE: " + "estado "+respList.get(0).estado);
            //javascript:location.reload();
          }
        };
        xhttp.open("POST", tramo.providerUrl +"/reservar", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(tramo));
    }
    console.log("ACA EMPIEZA LA VERIFICACION PARA EL COMMITED");
    //aca verificar que todos respondieron OK
    //sino hacer un rollback
    var xhttp = new XMLHttpRequest();
    console.log("Entra en: "+!isFallo());
    if (!isFallo()) {
        // aca hago el commit
        for (i = 0; i < respList.length; i++) {
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("COMMITED PASAJE: " + this.responseText);
                    respList.removeAtIndex(i);
                }
            };
            xhttp.open("POST", respList.search(i).data.url +"/commited", false);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.send(JSON.stringify({id:respList.search(i).data.idres}));
        }
        alert("RESERVA PASAJE: OK");
        javascript:location.reload();
    }else{
        // aca hago el rollback
        for (i = 0; i < respList.length; i++) {
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("ROLLBACK PASAJE: " + this.responseText);
                    respList.removeAtIndex(i);
                }
            };
            xhttp.open("POST", respList.search(i).data.url +"/rollback", false);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.send(JSON.stringify({id:respList.search(i).data.idres}));
        }
        alert("RESERVA PASAJE: FALLO");
        javascript:location.reload();
    }
    
    
}

function isFallo(){
    var fallo = false;
    for (i = 0; i < respList.length && !fallo; i++) {
        if (respList.search(i).data.estado==="FALLO") {
            fallo = true;
            break;
        }
    }
    return fallo;
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

