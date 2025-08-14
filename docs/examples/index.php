<style>
	#breadcrumb {
		display: none;
	}
	#footer {
		display: none;
	}
</style>
<div id="map" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="250"></div>
<script>
// Street Data
var dataStreets = [
	// Los Santos County
	{"loc":[-80.90,4.50], "title":"Abattoir Avenue"},
	{"loc":[-56.5,-27.5], "title":"Abe Milton Parkway"},
	{"loc":[-43.4,-63.5], "title":"Ace Jones Drive"},
	{"loc":[-68.7,-15.3], "title":"Adam's Apple Boulevard"},
	{"loc":[-71.2,-47.8], "title":"Aguja Street"},
	{"loc":[-55.1,-9.90], "title":"Alta Place"},
	{"loc":[-57.5,-13.9], "title":"Alta Street"},
	{"loc":[-74.0,22.70], "title":"Amarillo Vista"},
	{"loc":[-74.50,18.8], "title":"Amarillo Way"},
	{"loc":[-52.2,-60.1], "title":"Americano Way"},
	{"loc":[-66.65,-3.8], "title":"Atlee Street"},
	{"loc":[-77.1,-25.9], "title":"Autopia Parkway"},
	{"loc":[-31.0,-86.0], "title":"Banham Canyon Drive"},
	{"loc":[-29.2,-108.0], "title":"Barbareno Road"},
	{"loc":[-67.1,-51.7], "title":"Bay City Avenue"},
	{"loc":[-60.4,-69.4], "title":"Bay City Incline"},
	{"loc":[-34.5,-6.1], "title":"Baytree Canyon Road"},
	{"loc":[-56.3,-44.8], "title":"Boulevard Del Perro"},
	{"loc":[-57.8,13.1], "title":"Bridge Street"},
	{"loc":[-74.4,-10.1], "title":"Brouge Avenue"},
	{"loc":[-80.7,6.2], "title":"Buccaneer Way"},
	{"loc":[-7.4,-73.3], "title":"Buen Vino Road"},
	{"loc":[-52.7,-39.0], "title":"Caesars Place"},
	{"loc":[-66.6,-30.3], "title":"Calais Avenue"},
	{"loc":[-71.6,7.1], "title":"Capital Boulevard"},
	{"loc":[-57.4,-28.7], "title":"Carcer Way"},
	{"loc":[-74.0,-12.1], "title":"Carson Avenue"},
	{"loc":[-79.2,-1.8], "title":"Chum Street"},
	{"loc":[-79.4,-14.6], "title":"Chupacabra Street"},
	{"loc":[-48.0,-1.6], "title":"Clinton Avenue"},
	{"loc":[-43.4,-43.5], "title":"Cockingend Drive"},
	{"loc":[-68.1,-52.41], "title":"Conquistador Street"},
	{"loc":[-69.1,-51.9], "title":"Cortes Street"},
	{"loc":[-58.3,-59.6], "title":"Cougar Avenue"},
	{"loc":[-75.3,-10.2], "title":"Covenant Avenue"},
	{"loc":[-45.3,-27.6], "title":"Cox Way"},
	{"loc":[-70.5,-5.0], "title":"Crusade Road"},
	{"loc":[-73.0,-9.5], "title":"Davis Avenue"},
	{"loc":[-65.3,-39.8], "title":"Decker Street"},
	{"loc":[-45.2,-20.6], "title":"Didion Drive"},
	{"loc":[-58.3,-37.3], "title":"Dorset Drive"},
	{"loc":[-58.4,-27.1], "title":"Dorset Place"},
	{"loc":[-77.7,9.6], "title":"Dry Dock Street"},
	{"loc":[-46.7,-42.1], "title":"Dunstable Drive"},
	{"loc":[-46.2,-41.2], "title":"Dunstable Lane"},
	{"loc":[-76.6,-26.9], "title":"Dutch London Street"},
	{"loc":[-55.8,-31.7], "title":"Eastbourne Way"},
	{"loc":[-20.9,-14.4], "title":"East Galileo Avenue"},
	{"loc":[-61.8,21.7], "title":"East Mirror Drive"},
	{"loc":[-48.1,-21.9], "title":"Eclipse Boulevard"},
	{"loc":[-50.6,-38.2], "title":"Edwood Way"},
	{"loc":[-58.2,-1.2], "title":"Elgin Avenue"},
	{"loc":[-74.9,34.9], "title":"El Burro Boulevard"},
	{"loc":[-73.2,23.6], "title":"El Rancho Boulevard"},
	{"loc":[-64.6,-60.2], "title":"Equality Way"},
	{"loc":[-77.9,-32.7], "title":"Exceptionalists Way"},
	{"loc":[-68.1,-6.2], "title":"Fantastic Place"},
	{"loc":[-46.6,8.2], "title":"Fenwell Place"},
	{"loc":[-72.8,-19.2], "title":"Forum Drive"},
	{"loc":[-72.9,22.2], "title":"Fudge Lane"},
	{"loc":[-8.3,-31.1], "title":"Galileo Road"},
	{"loc":[-46.9,-18.9], "title":"Gentry Lane"},
	{"loc":[-64.7,-36.5], "title":"Ginger Street"},
	{"loc":[-58.4,10.3], "title":"Glory Way"},
	{"loc":[-71.8,-46.6], "title":"Goma Street"},
	{"loc":[-77.3,-42.1], "title":"Greenwich Parkway"},
	{"loc":[-47.0,-48.8], "title":"Greenwich Place"},
	{"loc":[-46.6,-44.3], "title":"Greenwich Way"},
	{"loc":[-75.0,-15.1], "title":"Grove Street"},
	{"loc":[-79.0,11.2], "title":"Hanger Way"},
	{"loc":[-42.1,-54.41], "title":"Hangman Avenue"},
	{"loc":[-48.8,-55.9], "title":"Hardy Way"},
	{"loc":[-55.7,-13.8], "title":"Hawick Avenue"},
	{"loc":[-59.2,-40.3], "title":"Heritage Way"},
	{"loc":[-38.8,-40.2], "title":"Hillcrest Avenue"},
	{"loc":[-40.1,-40.6], "title":"Hillcrest Ridge Access Road"},
	{"loc":[-67.5,-45.7], "title":"Imagination Court"},
	{"loc":[-61.0,-46.5], "title":"Industry Passage"},
	{"loc":[-44.2,-103.0], "title":"Ineseno Road"},
	{"loc":[-62.7,-7.5], "title":"Integrity Way"},
	{"loc":[-68.5,-43.9], "title":"Invention Court"},
	{"loc":[-72.9,-3.3], "title":"Innocence Boulevard"},
	{"loc":[-75.3,-2.8], "title":"Jamestown Street"},
	{"loc":[-40.8,-23.5], "title":"Kimble Hill Drive"},
	{"loc":[-48.0,-75.8], "title":"Kortz Drive"},
	{"loc":[-75.0,19.6], "title":"Labor Place"},
	{"loc":[-54.1,-14.4], "title":"Laguna Place"},
	{"loc":[-41.1,-17.4], "title":"Lake Vinewood Drive"},
	{"loc":[-58.5,-19.1], "title":"Las Lagunas Boulevard"},
	{"loc":[-60.5,-61.4], "title":"Liberty Street"},
	{"loc":[-66.7,-33.7], "title":"Lindsay Circus"},
	{"loc":[-74.2,2.5], "title":"Little Bighorn Avenue"},
	{"loc":[-63.4,-12.9], "title":"Low Power Street"},
	{"loc":[-73.7,-6.6], "title":"Macdonald Street"},
	{"loc":[-55.1,-40.5], "title":"Mad Wayne Thunder Drive"},
	{"loc":[-69.6,-52.1], "title":"Magellan Avenue"},
	{"loc":[-60.0,-50.2], "title":"Marathon Avenue"},
	{"loc":[-32.8,-24.6], "title":"Marlowe Drive"},
	{"loc":[-72.7,-47.0], "title":"Melanoma Street"},
	{"loc":[-54.2,-2.2], "title":"Meteor Street"},
	{"loc":[-43.3,-31.0], "title":"Milton Road"},
	{"loc":[-62.1,19.1], "title":"Mirror Park Boulevard"},
	{"loc":[-62.6,14.5], "title":"Mirror Place"},
	{"loc":[-58.0,-53.4], "title":"Morningwood Boulevard"},
	{"loc":[-27.8,-3.0], "title":"Mount Haan Drive"},
	{"loc":[-20.3,16.4], "title":"Mount Haan Road"},
	{"loc":[-13.3,-40.9], "title":"Mount Vinewood Drive"},
	{"loc":[-60.8,-41.7], "title":"Movie Star Way"},
	{"loc":[-74.8,-32.6], "title":"Mutiny Road"},
	{"loc":[-80.3,-44.5], "title":"New Empire Way"},
	{"loc":[-61.1,17.1], "title":"Nikola Avenue"},
	{"loc":[-61.8,23.7], "title":"Nikola Place"},
	{"loc":[-39.2,-34.1], "title":"Normandy Drive"},
	{"loc":[-50.3,-18.3], "title":"North Archer Avenue"},
	{"loc":[-45.3,-1.8], "title":"North Conker Avenue"},
	{"loc":[-36.9,-45.3], "title":"North Sheldon Avenue"},
	{"loc":[-54.0,-62.7], "title":"North Rockford Drive"},
	{"loc":[-58.4,-10.5], "title":"Occupation Avenue"},
	{"loc":[-76.7,12.0], "title":"Orchardville Avenue"},
	{"loc":[-67.8,-34.2], "title":"Palomino Avenue"},
	{"loc":[-64.5,-22.3], "title":"Peaceful Street"},
	{"loc":[-57.7,-55.2], "title":"Perth Street"},
	{"loc":[-45.6,-50.8], "title":"Picture Perfect Drive"},
	{"loc":[-79.8,-17.4], "title":"Plaice Place"},
	{"loc":[-59.5,-68.9], "title":"Playa Vista"},
	{"loc":[-69.4,8.3], "title":"Popular Street"},
	{"loc":[-57.3,-34.8], "title":"Portola Drive"},
	{"loc":[-61.2,-11.5], "title":"Power Street"},
	{"loc":[-68.0,-44.9], "title":"Prosperity Street"},
	{"loc":[-63.9,-51.8], "title":"Prosperity Street Promenade"},
	{"loc":[-64.0,-55.9], "title":"Red Desert Avenue"},
	{"loc":[-48.0,-64.3], "title":"Richman Street"},
	{"loc":[-54.8,-34.4], "title":"Rockford Drive"},
	{"loc":[-74.5,-5.0], "title":"Roy Lowenstein Boulevard"},
	{"loc":[-72.6,-43.3], "title":"Rub Street"},
	{"loc":[-53.3,-58.3], "title":"Sam Austin Drive"},
	{"loc":[-63.8,-18.3], "title":"San Andreas Avenue"},
	{"loc":[-66.2,-55.6], "title":"Sandcastle Way"},
	{"loc":[-54.1,-22.5], "title":"San Vitus Boulevard"},
	{"loc":[-11.9,19.9], "title":"Senora Road"},
	{"loc":[-71.0,-35.0], "title":"Shank Street"},
	{"loc":[-78.3,-4.7], "title":"Signal Street"},
	{"loc":[-66.3,-3.2], "title":"Sinner Street"},
	{"loc":[-65.6,-1.5], "title":"Sinners Passage"},
	{"loc":[-74.2,-31.2], "title":"South Arsenal Street"},
	{"loc":[-56.8,-43.2], "title":"South Boulevard Del Perro"},
	{"loc":[-41.7,-42.2], "title":"South Mo Milton Drive"},
	{"loc":[-67.7,-38.3], "title":"South Rockford Drive"},
	{"loc":[-78.3,15.4], "title":"South Shambles Street"},
	{"loc":[-51.6,-18.9], "title":"Spanish Avenue"},
	{"loc":[-50.0,-43.6], "title":"Steele Way"},
	{"loc":[-50.9,-33.8], "title":"Strangeways Drive"},
	{"loc":[-72.0,-12.3], "title":"Strawberry Avenue"},
	{"loc":[-66.7,13.5], "title":"Supply Street"},
	{"loc":[-69.9,36.5], "title":"Sustancia Road"},
	{"loc":[-62.2,-9.7], "title":"Swiss Street"},
	{"loc":[-70.2,-36.5], "title":"Tackle Street"},
	{"loc":[-56.5,11.6], "title":"Tangerine Street"},
	{"loc":[-18.5,-57.8], "title":"Tongva Drive"},
	{"loc":[-74.8,16.8], "title":"Tower Way"},
	{"loc":[-71.8,-45.2], "title":"Tug Street"},
	{"loc":[-64.0,23.7], "title":"Utopia Gardens"},
	{"loc":[-67.1,-12.2], "title":"Vespucci Boulevard"},
	{"loc":[-50.8,-3.6], "title":"Vinewood Boulevard"},
	{"loc":[-50.4,13.3], "title":"Vinewood Park Drive"},
	{"loc":[-70.0,-51.6], "title":"Vitus Street"},
	{"loc":[-82.0,-7.3], "title":"Voodoo Place"},
	{"loc":[-52.4,-56.3], "title":"West Eclipse Boulevard"},
	{"loc":[-23.8,-31.1], "title":"West Galileo Avenue"},
	{"loc":[-62.6,12.4], "title":"West Mirror Drive"},
	{"loc":[-41.7,-11.7], "title":"Whispymound Drive"},
	{"loc":[-43.9,-15.6], "title":"Wild Oats Drive"},
	{"loc":[-55.5,9.5], "title":"York Street"},
	{"loc":[-3.9,-42.4], "title":"Zancudo Barranca"},
	
	// Blaine County
	{"loc":[39.8,31.7], "title":"Algonquin Boulevard"},
	{"loc":[39.6,38.8], "title":"Alhambra Drive"},
	{"loc":[42.6,37.6], "title":"Armadillo Avenue"},
	{"loc":[-14.6,-11.1], "title":"Baytree Canyon Road"},
	{"loc":[44.5,-21.5], "title":"Calafia Road"},
	{"loc":[76.9,-19.1], "title":"Cascabel Avenue"},
	{"loc":[53.5,-49.1], "title":"Cassidy Trail"},
	{"loc":[26.2,51.2], "title":"Cat-Claw Avenue"},
	{"loc":[59.4,85.7], "title":"Catfish View"},
	{"loc":[42.1,74.0], "title":"Chianski Passage"},
	{"loc":[31.4,40.3], "title":"Cholla Road"},
	{"loc":[43.2,34.6], "title":"Cholla Springs Avenue"},
	{"loc":[75.3,-23.6], "title":"Duluoz Avenue"},
	{"loc":[47.9,57.1], "title":"East Joshua Road"},
	{"loc":[13.9,-56.6], "title":"Fort Zancudo Approach Road"},
	{"loc":[59.6,60.3], "title":"Grapeseed Avenue"},
	{"loc":[62.1,33.4], "title":"Grapeseed Main Street"},
	{"loc":[62.5,46.7], "title":"Joad Lane"},
	{"loc":[32.4,-7.5], "title":"Joshua Road"},
	{"loc":[39.4,27.2], "title":"Lesbos Lane"},
	{"loc":[39.9,34.3], "title":"Lolita Avenue"},
	{"loc":[40.1,24.8], "title":"Marina Drive"},
	{"loc":[38.1,23.5], "title":"Meringue Lane"},
	{"loc":[41.1,36.0], "title":"Mountain View Drive"},
	{"loc":[43.1,39.8], "title":"Niland Avenue"},
	{"loc":[53.1,9.6], "title":"North Calafia Way"},
	{"loc":[32.6,44.6], "title":"Nowhere Road"},
	{"loc":[63.4,51.5], "title":"O'Neil Way"},
	{"loc":[76.1,-20.8], "title":"Paleto Boulevard"},
	{"loc":[30.9,37.7], "title":"Panorama Drive"},
	{"loc":[76.6,-21.7], "title":"Procopio Drive"},
	{"loc":[73.6,-34.2], "title":"Procopio Promenade"},
	{"loc":[76.0,-18.9], "title":"Pyrite Avenue"},
	{"loc":[52.1,-49.2], "title":"Raton Pass"},
	{"loc":[20.1,-11.2], "title":"Route 68 Approach"},
	{"loc":[59.0,52.5], "title":"Seaview Road"},
	{"loc":[14.2,59.1], "title":"Senora Way"},
	{"loc":[30.1,47.4], "title":"Smoke Tree Road"},
	{"loc":[62.2,65.8], "title":"Union Road"},
	{"loc":[41.0,38.4], "title":"Zancudo Avenue"},
	{"loc":[4.2,-60.0], "title":"Zancudo Road"},
	{"loc":[29.3,-99.7], "title":"Zancudo Trail"},
	
	// Freeways & Highways
	{"loc":[-49.7,11.5], "title":"Los Santos Freeway"},
	{"loc":[-61.2,-26.7], "title":"Del Perro Freeway"},
	{"loc":[-69.4,-2.7], "title":"Olympic Freeway"},
	{"loc":[-71.6,-26.6], "title":"La Puerta Freeway"},
	{"loc":[44.0,-84.6], "title":"Great Ocean Highway - Route 1"},
	{"loc":[60.1,63.5], "title":"Senora Freeway - Route 13"},
	{"loc":[-29.5,52.5], "title":"Palomino Freeway - Route 15"},
	{"loc":[-79.9,7.3], "title":"Elysian Fields Freeway - Route 20"},
	{"loc":[15.2,-12.3], "title":"Route 68"},

	// Urban Routes
	// Tongva Drive - Route 11
	//{"loc":[0,0], "title":"Route 11"},

	// North Rockford Drive/Tonga Drive - Route 14
	//{"loc":[0,0], "title":"Route 14"},

	// Palomino Avenue/Mad Wayne Thunder Drive - Route 16
	//{"loc":[0,0], "title":"Route 16"},

	// Boulevard Del Perro/Hawick Avenue/Popular Street - Route 17
	//{"loc":[0,0], "title":"Route 17"},

	// West Eclipse Boulevard/Eclipse Boulevard/Vinewood Boulevard/Mirror Park Boulevard/El Rancho Boulevard - Route 18
	//{"loc":[0,0], "title":"Route 18"},

	// Alta Street/Davis Avenue - Route 19
	//{"loc":[0,0], "title":"Route 19"},

	// Alta Street/Davis Avenue - Route 19
	//{"loc":[0,0], "title":"Route 19"},

	// Dutch London Street - Route 22
	//{"loc":[0,0], "title":"Route 22"},
];

// Icons
var iconLocation = L.icon({
	iconUrl: 'map/images/blips/Blip-Blank.png',
	iconSize: [32, 32],
	popupAnchor: [0,0],
});

var iconEmergencyCall = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'red',
	iconColor: 'white',
	icon: 'phone',
});

var iconGovernmentBuilding = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'cadetblue',
	iconColor: 'white',
	icon: 'building',
});

var iconImpoundLot = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'cadetblue',
	iconColor: 'white',
	icon: 'truck-pickup',
});

var iconJail = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'cadetblue',
	iconColor: 'white',
	icon: 'lock',
});

var iconFireStation = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'darkred',
	iconColor: 'white',
	icon: 'fire-extinguisher',
});

var iconHospital = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'green',
	iconColor: 'white',
	icon: 'star-of-life',
});

var iconLifeguard = L.AwesomeMarkers.icon({
	prefix: 'fa-fw fa',
	markerColor: 'orange',
	iconColor: 'white',
	icon: 'life-ring',
});

// Bubble Popups
var governmentLoc01 = "<b>Mission Row Community Police Station</b>";
var governmentLoc02 = "<b>Vespucci Police Headquarters</b>";
var governmentLoc03 = "<b>Twin Towers Correctional Facility</b>";
var governmentLoc04 = "<b>Los Santos Police Department Impound Lot</b>";
var governmentLoc05 = "<b>Sandy Shores Sheriff's Station</b>";
var governmentLoc06 = "<b>Rockford Hills Community Police Station</b>";
var fireStation01 = "<b>Station 1 - Paleto Bay Fire Station</b>";
var fireStation02 = "<b>Station 1 - Paleto Bay Fire Station</b>";
var fireStation03 = "<b>Station 3 - Davis Fire Station</b>";
var fireStation04 = "<b>Station 4 - Sandy Shores Fire Station</b>";
var fireStation05 = "<b>Station 5 - Fort Zancudo Fire Station</b>";
var fireStation06 = "<b>Station 6 - Los Santos International Airport Fire Station</b>";
var fireStation07 = "<b>Station 7 - El Burro Heights Fire Station</b>";
var hospital01 = "<b>The Bay Care Center</b>";
var hospital02 = "<b>Central Los Santos Medical Center</b>";
var hospital03 = "<b>Sandy Shores Medical Center</b>";
var hospital04 = "<b>Saint Fiacre Hospital</b>";
var hospital05 = "<b>Mount Zonah Medical Center</b>";
var hospital06 = "<b>Pillbox Hill Medical Center</b>";
var lifeguard01 = "<b>Vespucci Beach Lifeguard Station</b>";
var lifeguard02 = "<b>Del Perro Beach Lifeguard Station</b>";

// Police Stations and Government Buildings
var governmentLoc = L.layerGroup();
L.marker([-67.3,-1.8],{icon: iconGovernmentBuilding}).bindPopup(governmentLoc01,popupOptions).addTo(governmentLoc);
L.marker([-65.5,-46.3],{icon: iconGovernmentBuilding}).bindPopup(governmentLoc02,popupOptions).addTo(governmentLoc);
L.marker([-59.3,57.9],{icon: iconJail}).bindPopup(governmentLoc03,popupOptions).addTo(governmentLoc);
L.marker([-73.4,-3.0],{icon: iconImpoundLot}).bindPopup(governmentLoc04,popupOptions).addTo(governmentLoc);
L.marker([39.95,37.75],{icon: iconGovernmentBuilding}).bindPopup(governmentLoc05,popupOptions).addTo(governmentLoc);
L.marker([-55.6,-31.4],{icon: iconGovernmentBuilding}).bindPopup(governmentLoc06,popupOptions).addTo(governmentLoc);

// Fire Stations
var fireStations = L.layerGroup();
L.marker([74.5,-25.6],{icon: iconFireStation}).bindPopup(fireStation01,popupOptions).addTo(fireStations);
L.marker([-73.5,-8.8],{icon: iconFireStation}).bindPopup(fireStation03,popupOptions).addTo(fireStations);
L.marker([38.1,34.1],{icon: iconFireStation}).bindPopup(fireStation04,popupOptions).addTo(fireStations);
L.marker([18.5,-76.1],{icon: iconFireStation}).bindPopup(fireStation05,popupOptions).addTo(fireStations);
L.marker([-78.4,-45.6],{icon: iconFireStation}).bindPopup(fireStation06,popupOptions).addTo(fireStations);
L.marker([-72.0,19.9],{icon: iconFireStation}).bindPopup(fireStation07,popupOptions).addTo(fireStations);

// Hospitals
var hospitals = L.layerGroup();
L.marker([76.0,-22.2],{icon: iconHospital}).bindPopup(hospital01,popupOptions).addTo(hospitals);
L.marker([-71.5,-4.9],{icon: iconHospital}).bindPopup(hospital02,popupOptions).addTo(hospitals);
L.marker([40.3,38.8],{icon: iconHospital}).bindPopup(hospital03,popupOptions).addTo(hospitals);
L.marker([-72.7,18.0],{icon: iconHospital}).bindPopup(hospital04,popupOptions).addTo(hospitals);
L.marker([-58.4,-28.7],{icon: iconHospital}).bindPopup(hospital05,popupOptions).addTo(hospitals);
L.marker([-62.2,-5.4],{icon: iconHospital}).bindPopup(hospital06,popupOptions).addTo(hospitals);

// Lifeguard Stations
var lifeguards = L.layerGroup();	
L.marker([-74.6,-49.5],{icon: iconLifeguard}).bindPopup(lifeguard01,popupOptions).addTo(lifeguards);
L.marker([-67.4,-58.1],{icon: iconLifeguard}).bindPopup(lifeguard02,popupOptions).addTo(lifeguards);

// Bubble Popup Options
var popupOptions = {
	'maxWidth': '512',
	'className' : 'custom',
}

// Map Style Settings
var mbAttr = 'San Andreas Street Guide - MDC',
	mbUrlStreet = 'map/mapStyles/styleStreet/{z}/{x}/{y}.jpg';

// Map Styles
var streets = L.tileLayer(mbUrlStreet, {id: 'mapbox.streets', attribution: mbAttr, noWrap: true, continuousWorld: false, bounds: [[-90, -180],[90, 180]]});

// Map Settings
var map = L.map('map', {
	center: [-45, -20],
	zoom: 4,
	maxZoom: 5,
	minZoom: 2,
	noWrap: true,
	zoomControl: false,
	continuousWorld: false,
	layers: [streets, governmentLoc, fireStations, hospitals, lifeguards]
});

// Base Maps
var baseLayers = {
	"Streets": streets
};

// Overlays
var overlays = {
	"Government Buildings": governmentLoc,
	"Fire Stations": fireStations,
	"Hospitals": hospitals,
	"Lifeguard Stations": lifeguards,
};

// Layer contain searched elements
var markersLayer = new L.LayerGroup();
map.addLayer(markersLayer);

// Control - Search Bar
var controlSearch = new L.Control.Search({
	layer: markersLayer,		// Layer where to search markers (L.LayerGroup)
	position: 'topleft',		// Search Bar postion
	collapsed: false,			// Search Bar collapsed?
	firstTipSubmit: true,		// Search first option from list on enter?
	initial: false,				// Search markers only by initial text?
	zoom: 12,					// Zoom level on search
	marker: false,				// True = Custom L.Marker / False = Hide
	textPlaceholder: 'Search Street Name'
});
map.addControl( controlSearch );

// Populate map with markers from sample street data
for (i in dataStreets) {
	var title = dataStreets[i].title,	//value searched
		loc = dataStreets[i].loc,		//position found
		marker = new L.Marker(new L.latLng(loc), {title: title}, {icon: iconLocation} );//se property searched
	marker.setOpacity(0);
	markersLayer.addLayer(marker);
}

// Control - Layers and Overlays
var controlLayers = new L.control.layers(
	baseLayers,
	overlays, {
		collapsed: false,
		position: 'bottomleft'
	}
);
map.addControl( controlLayers );

// Coordinates Debugger

map.on('click', function(e){
	var coord = e.latlng;
	var lat = coord.lat.toFixed(1);
	var lng = coord.lng.toFixed(1);
	console.log(lat + "," + lng);
	var coords = document.createElement("textarea");
	document.body.appendChild(coords);
	coords.value = lat + "," + lng;
	coords.select();
	document.execCommand("copy");
	document.body.removeChild(coords);
});


window.FontAwesomeConfig = {
	searchPseudoElements: true
}
</script>