/**
 * MapGenerationService.js
 * Service to generate HTML for map displays
 */

/**
 * Generates Google Maps HTML for outdoor route visualization
 * @param {Array} outdoorRoute - Array of coordinates for the route
 * @param {String} apiKey - Google Maps API key
 * @returns {String} HTML string with Google Maps embed
 */
export const generateMapHtml = (outdoorRoute, apiKey) => {
  if (!outdoorRoute || outdoorRoute.length === 0) {
    return `
        <html>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <div style="text-align:center;color:#666;">
              <p>Loading map directions...</p>
            </div>
          </body>
        </html>
      `;
  }

  // Calculate center of the route
  const center = outdoorRoute.reduce(
    (acc, point) => {
      acc.latitude += point.latitude / outdoorRoute.length;
      acc.longitude += point.longitude / outdoorRoute.length;
      return acc;
    },
    { latitude: 0, longitude: 0 },
  );

  // Convert route to Google Maps format
  const routePoints = outdoorRoute
    .map((point) => `{lat: ${point.latitude}, lng: ${point.longitude}}`)
    .join(", ");

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map" style="width: 100%; height: 100%;"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: {lat: ${center.latitude}, lng: ${center.longitude}},
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false
              });
              
              const routeCoordinates = [${routePoints}];
              
              const routePath = new google.maps.Polyline({
                path: routeCoordinates,
                geodesic: true,
                strokeColor: "#800000",
                strokeOpacity: 1.0,
                strokeWeight: 4
              });
              
              routePath.setMap(map);
              
              // Add markers for start and end
              const startMarker = new google.maps.Marker({
                position: routeCoordinates[0],
                map: map,
                title: "Start"
              });
              
              const endMarker = new google.maps.Marker({
                position: routeCoordinates[routeCoordinates.length-1],
                map: map,
                title: "End"
              });
              
              // Fit map to bounds of route
              const bounds = new google.maps.LatLngBounds();
              routeCoordinates.forEach(coord => bounds.extend(coord));
              map.fitBounds(bounds);
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
        </body>
      </html>
    `;
};

export default {
  generateMapHtml,
};
