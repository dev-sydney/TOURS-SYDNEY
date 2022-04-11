// import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGV2LXN5ZG5leSIsImEiOiJjbDFqbWpzZTgyNmhxM3BwM3RvcTc0am40In0.9NAfNmmJO3C8qZcRu7Xf7g';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/dev-sydney/cl1lq1gno001114mh7k0tl3b3', // style URL
  scrollZoom: false,
  // center: [-74.5, 40], // starting position [lng, lat]
  // zoom: 9, // starting zoom
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //Creating Marker div element
  const el = document.createElement('div');
  el.className = 'marker';

  //Setting the markers coordinates to add to the map
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //Adding the popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds);
