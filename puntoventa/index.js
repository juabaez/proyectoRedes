/*
 * Module dependencies
 */
/* global __dirname, ciudades, require */

var express = require('express');
var xml = require('xmlhttprequest');
var stylus = require('stylus');
var nib = require('nib');

var app = express();
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}
app.set('views', __dirname);
app.set('view engine', 'jade');
logger = require('morgan');
app.use(logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));

app.use(stylus.middleware(
  { src: __dirname + '/public/js'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));

var empresas = ["http://localhost:8080","http://localhost:8081","http://localhost:8082"];
var ciudades = [];
app.get('/', function (req, res) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    for (var i=0; i < empresas.length; i++) {
        console.log(empresas[i]);
        var serverUrl = empresas[i];
        xhr.serverUrl = serverUrl;
        xhr.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var jsonTramos = JSON.parse(this.responseText);
            agregarCiudad(jsonTramos);
          }
        };
        xhr.open("GET", serverUrl+"/list", false);
        xhr.send();
    }
    res.render('index',
    { title : 'Venta De Pasajes', ciudades: ciudades}
    );
});

var reservas;
app.get('/reservas', function (req, res) {
    reservas = [];
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    for (var i=0; i < empresas.length; i++) {
        console.log(empresas[i]);
        var serverUrl = empresas[i];
        xhr.serverUrl = serverUrl;
        xhr.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var jsonReservas = JSON.parse(this.responseText);
            agregarReservas(jsonReservas,serverUrl);
          }
        };
        xhr.open("GET", serverUrl+"/listReservas", false);
        xhr.send();
    }
    res.render('reservas',
    { title : 'Venta De Pasajes', reservas: reservas}
    );
});

function agregarReservas(reservasjson,url){
    var jsonTramos;
    var tramo;
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    var serverUrl = url;
    var estado = false;
    xhr.serverUrl = serverUrl;
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        jsonTramos = JSON.parse(this.responseText);
        estado = true;
        }
    };
    xhr.open("GET", url+"/list", false);
    xhr.send();
    for (var i = 0; i < reservasjson.length; i++) {
        console.log("Id Reserva: "+reservasjson[i].idReserv+" Nombre: "+reservasjson[i].name);
        if (estado){
            for (var j = 0; j < jsonTramos.length; j++) {
                if (jsonTramos[j].id==reservasjson[i].idTramo) {
                    tramo = " | "+ jsonTramos[i].cOrigen + " - " + jsonTramos[i].cDestino;
                    break;
                }
            }
        }
        if(reservasjson[i].estado=="E"){
            reservas.push(reservasjson[i].idReserv+" - "+reservasjson[i].name + tramo);
        }
    }
}

function agregarCiudad(tramos){
    for (var i = 0; i < tramos.length; i++) {
        console.log("Origen: "+tramos[i].cOrigen+" Destino: "+tramos[i].cDestino+ " "+tramos[i].id);
        if (!contiene(tramos[i].cOrigen)) {
            ciudades.push(tramos[i].cOrigen);
        }
        if (!contiene(tramos[i].cDestino)) {
            ciudades.push(tramos[i].cDestino);
        }
    }
}

function contiene(ciudad){
    var contiene = false;
    for (var i = 0; i < ciudades.length; i++) {
        if (ciudades[i]===ciudad) {
            contiene = true;
            break;
        }
    }
    return contiene;
}

app.listen(3000);