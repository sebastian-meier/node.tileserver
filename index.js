require('sqlite3').verbose();
var express = require('express');
var http = require('http');
var app = express();
var tilelive = require('tilelive');
require('mbtiles').registerProtocols(tilelive);

/*
 'sources'	the array that holds all the mbtile sources that you want to host.
 'name' 	the key used to identify the source in an URL request
 'type' 	either vector or raster
 'url'		relative path to mbtiles file
*/
var sources = [
	{name: 'vector_example', 	source: null, type:'vector', url:'/tiles/vector_example.mbtiles'},
	{name: 'raster_example',	source: null, type:'raster', url:'/tiles/raster_example.mbtiles'}
];

//Building a key map, based on the name attribute
var source_ref = {};
for(var i in sources){
	source_ref[sources[i].name] = parseInt(i);
}

//Loading all sources and when done, starting the server
var source_count = 0;
function loadTiles(){
	tilelive.load('mbtiles://'+ __dirname + sources[source_count].url, function(err, source) {
    		if (err) { throw err;}

	    sources[source_count].source = source;

		if(source_count < (sources.length-1)){
			source_count++;
			loadTiles();
		}else{
			startServer();
		}
	});
}
loadTiles();


function startServer(){
	//Change if you want to use a different port
	app.set('port', 10060);

    app.use(function(req, res, next) {
    	//If anybody is allowed to request tiles from your server, replace the following lines with: res.header("Access-Control-Allow-Origin", "*");
    	//Otherwise insert your own URLs, that you allow to access the tile server
    	var origins = ['URL1', 'URL2', 'sites:8888'];
		for(var i=0;i<origins.length;i++){
			var origin = origins[i];
			if("origin" in req.headers){
				if(req.headers.origin.indexOf(origin) > -1){
					res.header("Access-Control-Allow-Origin", "*");
				}
			}
			if("referer" in req.headers){
				if(req.headers.referer.indexOf(origin) > -1){
					res.header("Access-Control-Allow-Origin", "*");
				}
			}
		}
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    //Depending on the file extension, either pbf or png, the route is set to vector or raster tiles
    app.get(/^\/v2\/tiles\/(.*)\/(\d+)\/(\d+)\/(\d+).pbf$/, function(req, res){

        var type = req.params[0];

		var good = false;
		if(type in source_ref){
			if(sources[source_ref[type]].type === "vector"){
				good = true;
			}
		}
		
		if(!good){
			//If the source is not available in the requested format return 404
			res.status(404)
				.send('Not found');
		}else{

	        var z = req.params[1];
	        var x = req.params[2];
	        var y = req.params[3];

	        sources[source_ref[type]].source.getTile(z, x, y, function(err, tile, headers) {
	            if (err) {
	            	res.set(headers);
	                res.send('');
	            } else {
	              res.set(headers);
	              res.send(tile);
	            }
	        });
	    }
    });

    app.get(/^\/v2\/tiles\/(.*)\/(\d+)\/(\d+)\/(\d+).png$/, function(req, res){

        var type = req.params[0];
        
		var good = false;
		if(type in source_ref){
			if(sources[source_ref[type]].type === "raster"){
				good = true;
			}
		}
		
		if(!good){
			//If the source is not available in the requested format return 404
			res.status(404)
				.send('Not found');
		}else{

	        var z = req.params[1];
	        var x = req.params[2];
	        var y = req.params[3];

	        //console.log('get tile %d, %d, %d', z, x, y);

	        sources[source_ref[type]].source.getTile(z, x, y, function(err, tile, headers) {
	            if (err) {
	            	res.set(headers);
	                res.send('');
	            } else {
	              res.set(headers);
	              res.send(tile);
	            }
	        });
	    }
    });

    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
}