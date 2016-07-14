# node.tileserver
Implementation of a tile server build in node.js

1. Install all required dependencies through npm.
2. Create you .mbtiles and place them in the 'tiles' folder
3. Remove the demo tiles from index.js and add your own file
4. Add the domain of your website to the 'Access-Allow-Origin-Array' or if its open to everyone remove the block as documented in index.js
5. Fire up your tile server 'node index.js'
6. Depending on what kind of tiles you are using, use the example code to embed your map in a website

Want to get started building your own maps:

Raster Data:
https://www.mapbox.com/tilemill/

Vector Data:
https://www.mapbox.com/mapbox-studio-classic/#darwin
(Mapbox Studio Classic has been replaced by Mapbox Studio, the online tool, note that the online version is not as open as the desktop version, you cannot download mbtiles from the online version, as far as i know)