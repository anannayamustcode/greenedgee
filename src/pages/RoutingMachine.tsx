// import React, { useEffect } from 'react';
// import { useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet-routing-machine';
// import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// const RoutingMachine = ({ waypoints, color, weight, opacity }: any) => {
//   const map = useMap();

//   useEffect(() => {
//     if (!map || waypoints.length < 2) return;

//     // Convert waypoints to LatLng objects
//     const latLngWaypoints = waypoints.map((wp: [number, number]) => L.latLng(wp[0], wp[1]));

//     // Create a routing control
//     const routingControl = L.Routing.control({
//       waypoints: latLngWaypoints,
//       routeWhileDragging: false,
//       showAlternatives: false,
//       addWaypoints: false,
//       draggableWaypoints: false,
//       fitSelectedRoutes: true,
//       show: false, // Hide the default instructions panel
//       createMarker: () => null, // Don't create default markers
//       lineOptions: {
//         styles: [{ color, weight, opacity }]
//       }
//     }).addTo(map);

//     // Clean up on unmount
//     return () => {
//       map.removeControl(routingControl);
//     };
//   }, [map, waypoints, color, weight, opacity]);

//   return null;
// };

// export default RoutingMachine;