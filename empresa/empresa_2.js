/* global __dirname */
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

var express = require('express');
var app = express();
var fs = require("fs");

var path = require('path');

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Reservas 
var reservas = [];
var reservasAux = new LinkedList();
var ires = 4;
//Reservas base
reservas.push({idReserv: 1, name: "Milagros Lunea",date:"2017-02-14",estado:"E",idTramo:5});
reservas.push({idReserv: 2, name: "Luciano Dominguez",date:"2017-01-03",estado:"E",idTramo:6});
reservas.push({idReserv: 3, name: "Eduardo Juarez",date:"2017-02-01",estado:"C",idTramo:7});

//Retorna si hay disponibles cierta cantidad de asientos en un tramo
var disponible = function(cant, reservados){
  return (cant-reservados)>0;
};

var server1 = 3;
app.get('/list', function (req, res) {
    fs.readFile( __dirname + "/datos/" + "tramos2.json", 'utf8', function (err, data) {
       res.end(data);
    });
    
});

app.get('/listReservas', function (req, res) {
    var resAux = [];
    var j = 1;
    cancelarReserva();
    for (var i = 0; i < reservas.length; i++) {
        if (reservas[i].estado=="E") {
            resAux.push(reservas[i]);
            j++;
        }
    }
    console.log("Reservas a completar / cancelar");
    console.log(resAux);
    res.end(JSON.stringify(resAux));
});

app.post('/completarreservas', function (req, res) {
    console.log(req.params);
    console.log(req.body);
    var idReservaCom = req.body;
    var resp = "FALLO";
    for (var i = 0; i < reservas.length; i++) {
        //console.log("Reserva en servidor "+reservas[i].idReserv + " Reserva a completar "+ idReservaCom.idres);
        if (reservas[i].idReserv == idReservaCom.idres) {
            if (reservas[i].estado == "E"){
                cambiarEstadoReserva(i,"C");
                resp = "OK";
                break;
            }else{
                break;
            }
        }
    }
    mostrarReserva("Reservas luego de cancelar");
    res.end(resp);
});

app.post('/cancelarreservas', function (req, res) {
    console.log(req.params);
    console.log(req.body);
    var idReservaCom = req.body;
    var resp = "FALLO";
    for (var i = 0; i < reservas.length; i++) {
        //console.log("Reserva en servidor "+reservas[i].idReserv + " Reserva a completar "+ idReservaCom.idres);
        if (reservas[i].idReserv == idReservaCom.idres) {
            if (reservas[i].estado == "E"){
                cambiarEstadoReserva(i,"CA");
                resp = "OK";
                break;
            }else{
                break;
            }
        }
    }
    mostrarReserva("Reservas luego de cancelar");
    res.end(resp);
});

app.post('/reservar', function (req, res) {
    //console.log(req.params);
    console.log("Tramo a reservar");
    console.log(req.body);
    cancelarReserva();
    var tramos;
    tramos = req.body;
//    console.log(tramos.cantidad);
//    console.log("cantidad "+tramos.cantidad +" "+tramos.reservado);
//    console.log(disponible(tramos.cantidad,tramos.reservado));
    if (disponible(tramos.cantidad,tramos.reservado)) {
        reservasAux.add({idReserv: ires, name: "Juan Baez",date:new Date().toLocaleDateString(),estado:"E",idTramo:tramos.id});
        mostrarReserva("RESERVAS LUEGO DE AGREGAR RESERVA EN AUX");
        actualizarReservas(tramos,tramos.id);
        ires++;
        res.end(JSON.stringify({estado:"OK",idres:ires-1,url:"http://localhost:"+ server.address().port}));
    } else {
        res.end(JSON.stringify({estado:"FALLO",url:"http://localhost:"+ server.address().port}));
    }
});

app.post('/commited', function (req, res) {
    //console.log(req.params);
    console.log(req.body);
    var idRes;
    idRes = req.body.id;
    var isexiste = false;
    try{
        for (var i =0; i < reservasAux.length && !isexiste; i++) {
            if (reservasAux.search(i).data.idReserv===idRes) {
                console.log("Commited "+JSON.stringify(reservasAux.search(i).data));
                reservas.push(reservasAux.search(i).data);
                reservasAux.removeAtIndex(i);
                isexiste = true;
                break;
            }
        }
        mostrarReserva("RESERVAS LUEGO DE COMMITEAR RESERVA");
        if (isexiste) {
            res.end("COMMITED");
        }else{
            res.end("FALLO");
        }
    }catch (err){
        res.end("FALLO");
    }
});

function cancelarReserva(){
    var resAux = [];
    for (var i = 0; i < reservas.length ; i++) {
        console.log("Parse cada reserva: "+JSON.stringify(reservas[i]));
        if (reservas[i].estado === "E" || reservas[i].estado === "CA"){
            var diff = server1;
            var dateReserva = new Date(reservas[i].date).getTime();
            var dateNow = new Date().getTime();
            var diffDate = (dateNow-dateReserva)/(1000*60*60*24);
            diffDate = diffDate.toPrecision(2)-1;
            console.log("Diff dias para cancelar: "+diff);
            console.log("Diff entre hoy y la reserva: "+diffDate);
            if (diffDate>diff || reservas[i].estado === "CA") {
                console.log("elimino reserva "+reservas[i].idReserv);
                console.log("elimino reserva "+reservas[i].estado);
                reservas.shift();
            }else{
                resAux.push(reservas.shift());
            }
        }else{
            resAux.push(reservas.shift());
        }
    }
    mostrarReserva("Reservas luego de cancelarlas automaticamente:");
}

function actualizarReservas(tramos,idTramo){
    var res = [];
    tramos = JSON.parse(fs.readFileSync(__dirname + "/datos/" + "tramos_Res_Actual2.json", 'utf8'));
    //console.log("Length: "+tramos.length);
    for (var i = 0; i < tramos.length; i++) {
        if (tramos[i].id == idTramo) {
            tramos[i].cantidad = tramos[i].cantidad - 1;
            tramos[i].reservado = tramos[i].reservado + 1;
        }
        //console.log(tramos[i]);
        res.push(tramos[i]);
    }
    //console.log(res);
    fs.writeFile(__dirname + "/datos/" + "tramos_Res_Actual.json",JSON.stringify(res),function(error){
        if (error)
            console.log(error);
        else
            console.log('Se actualizo la cantidad y las reservas con exito');
    });
}

var server = app.listen(8080, function () {

  //var host = server.address().address;
  //var port = server.address().port;
  mostrarReserva("RESERVAS AL COMENZAR");
  //console.log("Despues de cancelar las reservas");
  //console.log(reservas);
  //reservas.push({idReserv: ires, name: "Juan Baez",date:"2017-01-01",idTramo:3});
  //console.log("NEW");
  //console.log(reservas);
  console.log("Listen http://localhost:%s", server.address().port);

});

function mostrarReserva(text){
    console.log(text);
    console.log(reservas);
}

function cambiarEstadoReserva(indice,estado){
    reservas[indice].estado = estado;
}
