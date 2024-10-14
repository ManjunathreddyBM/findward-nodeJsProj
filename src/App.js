

import { Container, Row, Col, Form, Button, Alert, ProgressBar, InputGroup, Card } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from '../src/bbmplogo.jpeg';

const App = () => {
  const [latitude, setLatitude] = useState('N/A');
  const [longitude, setLongitude] = useState('N/A');
  const [wardName, setWardName] = useState('Not Found');
  const [wardNumber, setWardNumber] = useState('Not Found');

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdb9a4LIj6aaLdxOB47HRZKD8ouOB344Q&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 12.9716, lng: 77.5946 },
      zoom: 15,
    });

    markerRef.current = new window.google.maps.Marker({
      map: map,
      draggable: true,
    });

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById('searchInput'),
      { types: ['geocode'] }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      map.setCenter(place.geometry.location);
      markerRef.current.setPosition(place.geometry.location);
      displayCoordinates(place.geometry.location);
    });

    map.addListener('click', (event) => {
      placeMarker(event.latLng);
      displayCoordinates(event.latLng);
    });

    window.google.maps.event.addListener(markerRef.current, 'dragend', (event) => {
      displayCoordinates(event.latLng);
    });
  };

  const displayCoordinates = (location) => {
    setLatitude(location.lat());
    setLongitude(location.lng());
    getWard(location.lat(), location.lng());
  };

  const placeMarker = (location) => {
    markerRef.current.setPosition(location);
  };

  const pointInPolygon = (latitude, longitude, polygon) => {
    const n = polygon.length;
    let inside = false;

    const x = new Array(n);
    const y = new Array(n);

    for (let i = 0; i < n; i++) {
      const coord = polygon[i];
      x[i] = coord[0];
      y[i] = coord[1];
    }

    for (let i = 0, j = n - 1; i < n; j = i++) {
      if ((y[i] > latitude) !== (y[j] > latitude) &&
          (longitude < (x[j] - x[i]) * (latitude - y[i]) / (y[j] - y[i]) + x[i])) {
        inside = !inside;
      }
    }

    return inside;
  };

  const getWard = async (lat, lon) => {
    try {
      const response = await fetch('\ward_boundaries.json'); // Fetch the local JSON file
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const features = data.features;

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const geometry = feature.geometry;

        if (geometry.type === "MultiPolygon") {
          const coordinates = geometry.coordinates;
          for (let j = 0; j < coordinates.length; j++) {
            const polygon = coordinates[j][0]; // Accessing the first polygon
            if (pointInPolygon(lat, lon, polygon)) {
              const wardName = feature.properties.WARD_NAME;
              const wardNo = feature.properties.WARD_NO.toString();
              setWardName(wardName);
              setWardNumber(wardNo);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ward data:', error);
    }
  };

  return (
    <Container fluid>
      {/* <nav className="nav">
        <center className="logo">
          <a href="#">
            <img src={logo} style={{ width: '50px', height: 'auto' }} alt="BBMP Logo" />
          </a>
          <div>ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ( BBMP )</div>
        </center>
        <div className="">
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </nav> */}
<nav class="nav">
  <div class="logo-container">
    <a href="/images/bbmplogo.jfif">
      <img src={logo} class="logo" alt="BBMP Logo" />
    </a>
    <div class="logo-text">ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ( BBMP )</div>
  </div>

 
</nav>
      <br />
      <Row>
        <Col xs={12} md={9}>
          <Form.Group>
            <InputGroup>
              <Form.Control id="searchInput" type="text" placeholder="Enter a location" />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row><br/>
      <Row>
  <Col xs={12} md={9}>
    <div id="map" ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
  </Col>
  <Col xs={12} md={3}>
    <div className="coordinates" style={{ padding: '10px' }}>
      <h5>Coordinates</h5>
      <div>
        Latitude: <span id="latitude">{latitude}</span>
      </div>
      <div>
        Longitude: <span id="longitude">{longitude}</span>
      </div>
      <div style={{ marginTop: '20px' }}>
        <div id="result1">Ward Name: {wardName}</div>
        <div id="result2">Ward No: {wardNumber}</div>
      </div>
    </div>
  </Col>
</Row>

    </Container>
  );
};

export default App;

// import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
// import React, { useEffect, useRef, useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

// import './App.css';

// const App = () => {
//   const [latitude, setLatitude] = useState('N/A');
//   const [longitude, setLongitude] = useState('N/A');
//   const [wardName, setWardName] = useState('Not Found');
//   const [wardNumber, setWardNumber] = useState('Not Found');

//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const autocompleteRef = useRef(null);

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdb9a4LIj6aaLdxOB47HRZKD8ouOB344Q&libraries=places`;
//     script.async = true;
//     script.onload = initMap;
//     document.head.appendChild(script);
//   }, []);

//   const initMap = () => {
//     const map = new window.google.maps.Map(mapRef.current, {
//       center: { lat: 12.9716, lng: 77.5946 },
//       zoom: 15,
//     });

//     markerRef.current = new window.google.maps.Marker({
//       map: map,
//       draggable: true,
//     });

//     autocompleteRef.current = new window.google.maps.places.Autocomplete(
//       document.getElementById('searchInput'),
//       { types: ['geocode'] }
//     );

//     autocompleteRef.current.addListener('place_changed', () => {
//       const place = autocompleteRef.current.getPlace();
//       if (!place.geometry) return;

//       map.setCenter(place.geometry.location);
//       markerRef.current.setPosition(place.geometry.location);
//       displayCoordinates(place.geometry.location);
//     });

//     map.addListener('click', (event) => {
//       placeMarker(event.latLng);
//       displayCoordinates(event.latLng);
//     });

//     window.google.maps.event.addListener(markerRef.current, 'dragend', (event) => {
//       displayCoordinates(event.latLng);
//     });
//   };

//   const displayCoordinates = (location) => {
//     setLatitude(location.lat());
//     setLongitude(location.lng());
//     getWard(location.lat(), location.lng());
//   };

//   const placeMarker = (location) => {
//     markerRef.current.setPosition(location);
//   };

//   const getWard = async (lat, lon) => {
//     // Replace with your logic to fetch ward details
//   };

//   return (
//     <Container>
//       <nav className="nav">
//         <center className="logo">
//           <a href="/images/bbmplogo.jfif">
//             <img src="/images/bbmplogo.jfif" style={{ width: '50px', height: 'auto' }} alt="BBMP Logo" />
//           </a>
//           <div>ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ( BBMP )</div>
//         </center>
//       </nav>
//       <br />
//       <Row>
//         <Col xs={12} md={9}>
//           <Form.Group>
//             <InputGroup>
//               <Form.Control id="searchInput" type="text" placeholder="Enter a location" />
//             </InputGroup>
//           </Form.Group>
//           <div id="map" ref={mapRef} style={{ height: '400px', width: '100%', backgroundColor: '#f0f0f0' }}></div>
//         </Col>
//         <Col xs={12} md={3}>
//           <div className="coordinates" style={{ padding: '10px', backgroundColor: '#e9ecef', height: '400px' }}>
//             <h5>Coordinates</h5>
//             <div>
//               Latitude: <span id="latitude">{latitude}</span>
//             </div>
//             <div>
//               Longitude: <span id="longitude">{longitude}</span>
//             </div>
//             <div style={{ marginTop: '20px' }}>
//               <div id="result1">Ward Name: {wardName}</div>
//               <div id="result2">Ward No: {wardNumber}</div>
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default App;
