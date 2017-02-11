function addTramoInTable(paths){
    var tableDiv = document.getElementById("table");
    while(tableDiv.firstChild){
        tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.style.width = "500px";

    for (var i=0; i<paths.length; i++){
        var pathTr = document.createElement('TR');

        var path = paths[i];
        var pathTable = document.createElement('TABLE');
        pathTable.border='1';

        var pathTableCaption = document.createElement('CAPTION');
        pathTableCaption.appendChild(document.createTextNode("Option "+(i+1)));
        pathTable.appendChild(pathTableCaption);

        var pathTableBody = document.createElement('TBODY');
        pathTable.appendChild(pathTableBody);

        var pathTd = document.createElement('TD');
        pathTd.width='1000';
        pathTd.appendChild(pathTable);


        for (var j=0; j<path.length-1; j++){
            var travelInPath = travels.edge({ v: path[j], w: path[j+1] });
            var travelTr = document.createElement('TR');
            pathTableBody.appendChild(travelTr);
            var originTd = document.createElement('TD');
            var destinyTd = document.createElement('TD');
            originTd.style.paddingTop='10px';
            originTd.width='100';
            originTd.appendChild(document.createTextNode(path[j]));
            destinyTd.style.paddingTop='10px';
            destinyTd.width='100';
            destinyTd.appendChild(document.createTextNode(path[j+1]));
            travelTr.appendChild(originTd);
            travelTr.appendChild(destinyTd);
        }

        pathTr.appendChild(pathTd);
        tableDiv.appendChild(pathTable);
        var buttonReserve = document.createElement('BUTTON');
        buttonReserve.appendChild(document.createTextNode('Reserve'));
        buttonReserve.style.float='right';
        buttonReserve.travel = path;
        buttonReserve.onclick = function(){
            reserveTravels(this.travel);
        };
        tableDiv.appendChild(buttonReserve);
        tableDiv.appendChild(document.createElement('BR'));
        tableDiv.appendChild(document.createElement('BR'));
    }

}
