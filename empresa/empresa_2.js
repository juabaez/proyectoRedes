/* global __dirname */

var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Reservas 
var reserves = [];
var ires = 3;
//Reservas base
reserves.push({idReserv: 1, name: "Juan Baez",date:"2017-01-01",idTramo:5});
reserves.push({idReserv: 2, name: "Juan Baez",date:"2017-01-01",idTramo:6});

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

app.post('/reservar', function (req, res) {
   // Get the travel, and make the reservation if it can be done.
    console.log(req.params);
    console.log(req.body);
    cancelarReserva();
    var travelId = req.body.travelId;
    var tramos;
    fs.readFile( __dirname + "/datos/" + "tramos2.json", 'utf8', function (err, data) {
        tramos = JSON.parse( data );
    }); 
    if (disponible(tramos[travelId-1].places,tramos[travelId-1].reserved)) {
        reserves.push({idReserv: ires, name: "Juan Baez",date:new Date().toLocaleDateString(),idTramo:travelId-1});
        console.log("Nueva Reserva: " +
                {idReserv: ires, name: "Juan Baez",date:new Date().toLocaleDateString(),idTramo:travelId-1});
        ires++;
        res.end("OK");
    } else {
        res.end("FALLO");
    }
});

function cancelarReserva(){
    for (var i = reserves.length -1; i >=0 ; i--) {
        //console.log("Parse cada reserva: "+reserves[i]);
        var diff = server1;
        var dateReserva = new Date(reserves[i].date).getTime();
        var dateNow = new Date().getTime();
        var diffDate = (dateNow-dateReserva)/(1000*60*60*24);
        diffDate = diffDate.toPrecision(2)-1;
        console.log("Diff dias para cancelar: "+diff);
        console.log("Diff entre hoy y la reserva: "+diffDate);
        if (diffDate>diff) {
            reserves.pop();
            //reserves.remove(i);
        }
        if(reserves.length===0){
            ires=1;
        }
    }
}
var server = app.listen(8081, function () {

  var host = server.address().address;
  var port = server.address().port;
  console.log("Reservas al comenzar");
  console.log(reserves);
  //console.log("Despues de cancelar las reservas");
  //console.log(reserves);
  //reserves.push({idReserv: ires, name: "Juan Baez",date:"2017-01-01",idTramo:3});
  //console.log("NEW");
  //console.log(reserves);
  console.log("Listen http://localhost:%s", port);

});

