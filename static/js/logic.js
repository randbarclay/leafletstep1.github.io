// usgs earthquake json -- earthquakes in the past 7 days
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// perform a GET request to the query URL
d3.json(earthquakeUrl, function(d) {
	// send the data.features object to the createFeatures function
	createFeatures(d.features);
});

// define a function to colorize circles based on quakeitude
function getColor(mag) {
    return  mag > 5 ? "#F06B6B" :
        mag > 4 ? "#F0A76B" :
        mag > 3 ? "#F3BA4D" :
        mag > 2 ? "#F3DB4D" :
        mag > 1 ? "#E1F34D" :
        mag > 0 ? "#B7F34D" :
        "#B7F34D";
};

// define a function to create circles and tooltips for each earthquake
function createFeatures(earthquakeData) {
	// define a function to create tooltips for each earthquake
    function onEachFeature(feature, layer) { 
		layer.bindPopup(`<p><strong>Location:</strong> ${feature.properties.place}<hr>
			<p><strong>Magnitude:</strong> ${feature.properties.mag}</p> 
			<p><strong>Date:</strong> ${new Date(feature.properties.time)}</p>`);
	}
	// define a function to create circles for each earthquake
    function onEachPoint(feature, layer) {
      return new L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
		color: "#000000",
		weight: 1,
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 1,
        radius: feature.properties.mag * 50000
        });
    }
      
    // create a GeoJSON layer containing the features array on the earthquakeData object
    // run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
		onEachFeature: onEachFeature,
		pointToLayer: onEachPoint
    });
  
    // send our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

function createMap(earthquakes) {

    // define individual basemaps
    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });
  
    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
      });

    // define a baseMaps object to hold our base layers
    var baseMaps = {
		"Oudoors": outdoors,
		"Satellite": satellite,
		"Grayscale": lightmap
    };
  
    // create overlay object to hold our overlay layers
    var overlayMaps = {
      	Earthquakes: earthquakes
    };
  
    // create our map, giving it the streetmap and earthquakes layers to display on load
    var map = L.map("map", {
		center: [37.09, -95.71],
		zoom: 3,
		layers: [outdoors, earthquakes]
    });
  
	// create legend
	var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'legend'),
			bins = [0, 1, 2, 3, 4, 5],
			labels = [];
	
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < bins.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(bins[i] + 1) + '"></i> ' + bins[i] + (bins[i + 1] ? '&ndash;' + bins[i + 1] + '<br>' : '+');
		}
	
		return div;
	};
	
	legend.addTo(map);

    // layer control
    L.control.layers(baseMaps, overlayMaps, {
      	collapsed: false
    }).addTo(map);
};