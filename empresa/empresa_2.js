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
    console.log(req.params);
    console.log(req.body);
    cancelarReserva();
    var tramos;
    tramos = req.body;
//    console.log(tramos.cantidad);
//    console.log("cantidad "+tramos.cantidad +" "+tramos.reservado);
//    console.log(disponible(tramos.cantidad,tramos.reservado));
    if (disponible(tramos.cantidad,tramos.reservado)) {
        reservas.push({idReserv: ires, name: "Jose Perez",date:new Date().toLocaleDateString(),estado:"E",idTramo:tramos.id});
        mostrarReserva("RESERVAS LUEGO DE AGREGAR RESERVA");
        actualizarReservas(tramos,tramos.id);
        ires++;
        res.end("OK");
    } else {
        res.end("FALLO");
    }
});

function cancelarReserva(){
    var resAux = [];
    for (var i = reservas.length -1; i >=0 ; i--) {
        //console.log("Parse cada reserva: "+reservas[i]);
        if (reservas[i].estado == "E"){
            var diff = server1;
            var dateReserva = new Date(reservas[i].date).getTime();
            var dateNow = new Date().getTime();
            var diffDate = (dateNow-dateReserva)/(1000*60*60*24);
            diffDate = diffDate.toPrecision(2)-1;
            console.log("Diff dias para cancelar: "+diff);
            console.log("Diff entre hoy y la reserva: "+diffDate);
            if (diffDate>diff) {
                //console.log("elimino reserva "+reservas[i].idReserv);
                //console.log("elimino reserva "+reservas[i].estado);
                reservas.pop();
            }
        }else{
            resAux.push(reservas[i]);
            reservas.pop();
        }
    }
    reservas = resAux;
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
    fs.writeFile(__dirname + "/datos/" + "tramos_Res_Actual2.json",JSON.stringify(res),function(error){
        if (error)
            console.log(error);
        else
            console.log('Se actualizo la cantidad y las reservas con exito');
    });
}

var server = app.listen(8081, function () {

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
