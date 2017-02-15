function allTramosGrafo(grafo,nodoOrigen,nodoDestino,visitados){
  var i;
  var sucesores = grafo.successors(nodoOrigen);
  for(i = 0; i < sucesores.length; i++) {
    var sucesor = sucesores[i];
    if (sucesor === nodoDestino) {
      var encontrado = visitados.concat([nodoDestino]);
      paths.push(encontrado);
    } else {
      if (!isVisitado(visitados,sucesor)) {
        allTramosGrafo(grafo,sucesor,nodoDestino,visitados.concat([sucesor]));
      }
    }
  }
}

function isVisitado(visitado,nodo) {
  var i;
  for (i = 0; i < visitado.length ; i++) {
    if (visitado[i] === nodo)
      return true;
  }
  return false;
}