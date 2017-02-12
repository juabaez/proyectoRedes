/* global __dirname */

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
var ires = 3;
//Reservas base
reservas.push({idReserv: 1, name: "Juan Baez",date:"2017-01-01",idTramo:1});
reservas.push({idReserv: 2, name: "Juan Baez",date:"2017-01-01",idTramo:2});

//Retorna si hay disponibles cierta cantidad de asientos en un tramo
var disponible = function(cant, reservados){
  return (cant-reservados)>0;
};

var server1 = 3;
app.get('/list', function (req, res) {
    fs.readFile( __dirname + "/datos/" + "tramos.json", 'utf8', function (err, data) {
       res.end(data);
    });
    
});

app.post('/reservar', function (req, res) {
    console.log(req.params);
    console.log(req.body);
    cancelarReserva();
    var tramos;
    tramos = req.body;
    if (disponible(tramos.cantidad,tramos.reservado)) {
        reservas.push({idReserv: ires, name: "Juan Baez",date:new Date().toLocaleDateString(),idTramo:tramos.id});
        console.log(reservas);
        actualizarReservas(tramos,tramos.id);
        ires++;
        res.end("OK");
    } else {
        res.end("FALLO");
    }
});

function cancelarReserva(){
    for (var i = reservas.length -1; i >=0 ; i--) {
        //console.log("Parse cada reserva: "+reservas[i]);
        var diff = server1;
        var dateReserva = new Date(reservas[i].date).getTime();
        var dateNow = new Date().getTime();
        var diffDate = (dateNow-dateReserva)/(1000*60*60*24);
        diffDate = diffDate.toPrecision(2)-1;
        console.log("Diff dias para cancelar: "+diff);
        console.log("Diff entre hoy y la reserva: "+diffDate);
        if (diffDate>diff) {
            reservas.pop();
        }
        if(reservas.length===0){
            ires=1;
        }
    }
    console.log("Reservas luego de cancelarlas automaticamente");
    console.log(reservas);
}

function actualizarReservas(tramos,idTramo){
    var res = [];
    for (var i = 0; i < tramos.length; i++) {
        if (tramos[i].id == idTramo) {
            tramos[i].cantidad = tramos[i].cantidad - 1;
            tramos[i].reservado = tramos[i].reservado + 1;
        }
        res = tramos [i];
    }
    fs.writeFile(__dirname + "/datos/" + "tramos.json",JSON.stringify(res),function(error){
        if (error)
            console.log(error);
        else
            console.log('Se actualizo la cantidad y las reservas con exito');
    });
}

var server = app.listen(8080, function () {

  //var host = server.address().address;
  //var port = server.address().port;
  console.log("Reservas al comenzar");
  console.log(reservas);
  //console.log("Despues de cancelar las reservas");
  //console.log(reservas);
  //reservas.push({idReserv: ires, name: "Juan Baez",date:"2017-01-01",idTramo:3});
  //console.log("NEW");
  //console.log(reservas);
  console.log("Listen http://localhost:%s", server.address().port);

});

