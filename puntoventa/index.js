var express = require('express');
var argv = require('yargs')
			.usage('Usar: $0 -p [num]')
			.demand(['p'])
			.argv;
var app = express();
var unirest = require('unirest');
var extend = require('extend');
//var io = require('socket.io-client');


app.listen(argv.p, function () {
  	console.log('Punto de venta escuchando en puerto ' + argv.p);
});

var companies = {
				"empresa1" : {
								"host": "localhost",
								"port": "3000", 
								"stretches": "/stretches"
							 },
				"empresa2" : {
								"host": "localhost",
								"port": "3001", 
								"stretches": "/stretches"
							 }

			};

function connectSocket(url){
	var socket = require('socket.io-client')(url, {forceNew: true});
	socket.on('connect', function () { console.log("Empresa conectada: " + url ); });
	socket.on('disconnect', function () { console.log("Empresa desconectada: " + url); });
}

for (c in companies) {
  var url = 'http://' + companies[c].host + ':' + companies[c].port + '/';
  connectSocket(url);
}


// console.log(companies.empresa1.host);
// console.log(companies.empresa1.port);
// console.log(companies.empresa1.stretches);

// var stretches = // GET a resource
// 	unirest.get(companies.empresa1.host + ':' + companies.empresa1.port + companies.empresa1.stretches)
//   	.end(function(res) {
//     	if (res.error) {
//       		console.log('GET error', res.error)
//     	} else {
//       		console.log('GET response', res.body)
//     	}
//   	})

var graph = function(){
	var result = {};
	for (s in stretches){
		var arr = s.split('-');
		if (!result[arr[0]]){
			result[arr[0]] = [];
		}
	}
	for (s in stretches){
		var arr = s.split('-');
		result[arr[0]].push(arr[1]);
		
	}
	return result;
}


var stretches = function(callback){
	var result = {};
	for (c in companies){
		var url = 'http://' + companies[c].host + ':' + companies[c].port + companies[c].stretches;
		unirest.get(url).end(function(res) {
    	if (res.error) {
      		console.log('Error GET stretches');
    	} else {
      		extend(result, res.body);
      		//console.log(stretches);
      		//console.log(graph());
      		//return res.body;
    	}
  		});

		
	}
}


	  	




// var graph = {'A': ['B', 'C'],
//              'B': ['C', 'D'],
//              'C': ['D'],
//              'D': ['C'],
//              'E': ['F'],
//              'F': ['C']};

var find_all_paths = function(graph, start, end, path){
	path = path.concat([start]); // + [start];
	if (start == end){
		return [path];
	}
	if (!graph[start]){
		return [];
	}
	var paths = [];
	for (n in graph[start]){
		var node = graph[start][n];
		if (!(node in path)){
			var newpaths = find_all_paths(graph, node, end, path);
			for (newpath in newpaths){
				paths.push(newpaths[newpath]);
			}
		}
	}
	return paths;
};

//console.log(find_all_paths(graph(), 'B', 'C', []));