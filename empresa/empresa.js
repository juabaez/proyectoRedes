/* global __dirname */

var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser')
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
reserves.push({idReserv: 1, name: "Juan Baez",date:"2017-01-01",idTramo:1});
reserves.push({idReserv: 2, name: "Juan Baez",date:"2017-01-01",idTramo:1});

//Retorna si hay disponibles cierta cantidad de asientos en un tramo

var disponible = function(cant, reservados){
  return (cant-reservados)>0;
};


var turno = true;
var server1 = 3;
var server2 = 2;
app.get('/list', function (req, res) {
    if (turno){
        turno=false;
        fs.readFile( __dirname + "/datos/" + "tramos.json", 'utf8', function (err, data) {
           res.end(data);
        });
    }else{
        fs.readFile( __dirname + "/datos/" + "tramos2.json", 'utf8', function (err, data) {
           res.end(data);
        });
    }
});

app.post('/reservation', function (req, res) {
   // Get the travel, and make the reservation if it can be done.
   console.log(req.params);
   console.log(req.body);
   var travelId = req.body.travelId;
   var tramos;
    if (1<=(travelId-1)<=4) {
        fs.readFile( __dirname + "/data/" + "tramos.json", 'utf8', function (err, data) {
            tramos = JSON.parse( data );
        }); 
    }else{
        fs.readFile( __dirname + "/data/" + "tramos.json", 'utf8', function (err, data) {
            tramos = JSON.parse( data );
        });
    }
    if (disponible(tramos[travelId-1].places,tramos[travelId-1].reserved)) {
        reserves.push({idReserv: ires, name: "Juan Baez",date:new Date().toLocaleDateString(),idTramo:travelId-1});
        ires++;
        res.end("ReservaOK");
    } else {
        res.end("ReservaFAIL");
    }
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;
  //console.log(new Date().toLocaleDateString());
  console.log(reserves);

  console.log("Example app listening at http://%s:%s", host, port);

});

var server2 = app.listen(8081, function () {

  var host = server2.address().address;
  var port = server2.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});
