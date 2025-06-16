console.log('hello world');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoiYWxhZ2FtbWFpIiwiYSI6ImNtYmMzcDY4NjE1eTcybHNieXVtanB3cHQifQ.aO0iw33LXjfodhDQeG8f1w';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
  zoom: 1,
  center: [30, 15],
});
