/* global __dirname */

var express = require('express');
/*var argv = require('yargs')
			.usage('Usar: $0 -p [num puerto] -t [archivo_tramos.json]')
			.demand(['p','t'])
			.argv;
*/
var argv;
var app = express();
var path = require('path');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require("fs");

//Empresas OffLine
var empresaOff = [];

//Tramos {Nombre : {Asientos disponibles, precio}}
// var stretches = {
// 					"A-C" : {"seats":25, "price":250},
// 					"A-B" : {"seats":22, "price":60},
// 					"B-C" : {"seats":21, "price":210},
// 					"C-D" : {"seats":17, "price":194}
// 				};
//var stretches = require(path.resolve('./', argv.t));
/*var stretches = require(path.resolve('./viajes', "tramos.json"));

//Reservas 
var reserves = [];

//Retorna si hay disponibles cierta cantidad de asientos en un tramo
var avaible = function(stretch, cant){
	return (stretch.seats >= cant);
}

var cancel = function(nRes){
	if (-1<nRes && nRes<reserves.length && reserves[nRes]) {
		stretches[reserves[nRes].stretch].seats += reserves[nRes].cant;
		delete reserves[nRes];
		return 'Ok';
	}
	else {
		return 'Error';
	}
}

app.get('/stretches', function (req, res) {
	res.send(stretches);
});

app.post('/reserve/:stretch/:cant', function (req, res) {
	var stretch = req.params.stretch;
	var cant = parseInt(req.params.cant);
	var nRes = reserves.length;
	if (stretches[stretch] && avaible(stretches[stretch], cant)) {
		stretches[stretch].seats -= cant;
		var timeoutId = setTimeout(cancel, 5000, nRes);
		reserves.push({"stretch":stretch,"cant":cant, "timeoutId":timeoutId});
		res.send('' + nRes);
	}
	else {
		res.send('Error');
	}
});

app.post('/confirm/:nRes', function (req, res) {
	var nRes = parseInt(req.params.nRes);
	if (reserves[nRes]){
		clearTimeout(reserves[nRes].timeoutId);
		res.send('Ok');
	}
	else {
		res.send('Error');
	}
	
});

app.post('/cancel/:nRes', function (req, res) {
	var nRes = parseInt(req.params.nRes);
	res.send(cancel(nRes));
}); 

http.listen(argv.p, function () {
  	console.log('Empresa escuchando en puerto ' + argv.p);
});*/

app.get('/list', function (req, res) {
    // verifica que empresas estan offline
    // luego para realizar las reservas y cancelarlas le preguntamos al vector empresaOff
    // y si es tiene algun elemento sabemos que debemos guardar en un archivo o log las acciones que se realizen
    empresasOnline();
    fs.readFile( __dirname + "/datos/" + "tramos.json", 'utf8', function (err, data) {
       //console.log( data );
       var stringOffLine = "Empresas OffLine:\n"+"Name: "+empresaOff[0]+"\n"+"Name: "+empresaOff[1]+"\n\n";
       res.end(stringOffLine + data );
    });
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});

function empresasOnline(){
    var empresas = require(path.resolve('./datos', "empresas.json"));
    console.log(empresas);
    var stringify = JSON.stringify(empresas);
    var parserEm = JSON.parse(stringify);
    console.log(parserEm);
    var j = 0;
    console.log("cant Empresas " + parserEm.length);
    for (var i = 0; i < parserEm.length; i++) {
        console.log("Id: " + parserEm[i].id + " Name: "+parserEm[i].nameEnterprice);
        if (!tieneTramos(parserEm[i].id)) {
            empresaOff[j] = parserEm[i].nameEnterprice;
            j++;
        }
    }
}

function tieneTramos(id){
    var tramo = require(path.resolve('./datos', "tramos.json"));
    var stringify = JSON.stringify(tramo);
    var parserTramo = JSON.parse(stringify);
    var i = 0;
    var Encontrado = false;
    while (i<parserTramo.length && !Encontrado){
        if (parserTramo[i].idEnterprice == id) {
            Encontrado = true;
        }
        i++;
    }
    console.log(Encontrado);
    return Encontrado;
}


