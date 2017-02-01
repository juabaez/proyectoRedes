/*
 * Module dependencies
 */
/* global __dirname, ciudades */

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');

var app = express();
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.logger('dev'));
logger = require('morgan');
app.use(logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));

app.use(express.static(__dirname + '/public'));

var empresas = ["http://localhost:8080","http://localhost:8081","http://localhost:8082"];

//ciudades = ["Río Cuarto", "Córdoba", "Buenos Aires", "Rosario", "Rio de Janeiro", "Brasilia","New York", "Los Angeles"];
var ciudades = function(){
    for (var i=0; i < empresas.length; i++) {
        var serverUrl = empresas[i];

        var xhttp = new XMLHttpRequest();
        xhttp.serverUrl = serverUrl;
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var jsonTramos = JSON.parse(this.responseText);
            agregarCiudad(jsonTramos);
          }
        };
        xhttp.open("GET", serverUrl+"/list", true);
        xhttp.send();
    }
};
  
app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home', ciudades: ciudades}
  );
});
app.listen(3000);

app.get('/add', function (req, res) {
    var serverUrl = "http://localhost:8080";

    var xhttp = new XMLHttpRequest();
    xhttp.serverUrl = serverUrl;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var jsonTramos = JSON.parse(this.responseText);
        agregarCiudad(jsonTramos);
      }
    };
    xhttp.open("GET", serverUrl+"/list", true);
    xhttp.send();
});
function agregarCiudad(tramos){
    
    console.log(tramos[0].cOrigen);
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
        var s;
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
};

var stretches = function(callback){
	var result = {};
        var c;
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
};

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