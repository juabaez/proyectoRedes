function findAllPaths(graph,originNode,destinyNode,visited){
  var i;
  var successors = graph.successors(originNode);
  for(i = 0; i < successors.length; i++) {
    var successor = successors[i];
    if (successor === destinyNode) {
      var pathFound = visited.concat([destinyNode]);
      paths.push(pathFound);
    } else {
      if (!nodeVisited(visited,successor)) {
        findAllPaths(graph,successor,destinyNode,visited.concat([successor]));
      }
    }
  }
}

function nodeVisited(visited,node) {
  var i;
  for (i = 0; i < visited.length ; i++) {
    if (visited[i] === node)
      return true;
  }
  return false;
}