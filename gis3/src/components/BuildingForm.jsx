import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Container } from "react-bootstrap";
import { fetchBuildings, getAcerasCercanas } from "../api/client";

import { WKB } from 'ol/format';

import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, toast } from "react-toastify";

const SelectControl = ({ name, value, onChange, placeholder, options }) => (
  <Form.Control as="select" name={name} value={value} onChange={onChange}>
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </Form.Control>
);

const BuildingForm = () => {
  const [buildings, setBuildings] = useState([]);
  const [selectedIds, setSelectedIds] = useState({ id1: "", id2: "" });

  const [route, setRoute] = useState([]);
  const [routeFlag, setRouteFlag] = useState(false);

  // Function to fetch buildings and update state
  async function getBuildings() {
    try {
      const data = await fetchBuildings();
      console.log("Fetched buildings:", data); // Log the fetched data
      setBuildings(data);
    } catch (error) {
      console.error("Error fetching buildings", error.message);
    }
  }

  // Fetch buildings on component mount
  useEffect(() => {
    getBuildings();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  // Handle select change for ID 1 or ID 2
  function handleChange(event) {
    setSelectedIds({ ...selectedIds, [event.target.name]: event.target.value });
  }

  // Handle form submit
  async function handleSubmit(event) {
    event.preventDefault();

    // Validation: Check if IDs are selected
    if (!selectedIds.id1 || !selectedIds.id2) {
      // Display toast message for not selecting IDs
      toast.error("Por favor selecciona ambos edificios.");
      return;
    }

    // Validation: Check if IDs are equal
    if (selectedIds.id1 === selectedIds.id2) {
      // Display toast message for equal IDs
      toast.error("Los dos IDs no pueden ser iguales.");
      return; // Exit early if IDs are equal
    }

    try {
      setRouteFlag(false);
      const result = await getAcerasCercanas(selectedIds.id1, selectedIds.id2);
      console.log(result); // Log the result
      setRoute(result);
    } catch (error) {
      console.error("Error fetching aceras cercanas", error.message);
    }
  }


  function wkbToSvgPath(wkbString) {
    // Convert WKB hex string to byte array
    const hexToBytes = hex => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    };

    const byteArray = hexToBytes(wkbString);

    // Parse WKB byte array to Geometry using OpenLayers
    const format = new WKB();
    const feature = format.readFeature(byteArray.buffer);
    const geometry = feature.getGeometry();

    // Convert Geometry to GeoJSON coordinates
    const coordinates = geometry.getCoordinates();

    // Helper function to convert coordinates to SVG path
    const geoJSONToSVGPath = coordinates => {
      return coordinates.map((coord, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${coord[0]} ${coord[1]}`;
      }).join(' ');
    };

    // Handle different geometry types
    let svgPath = '';
    if (geometry.getType() === 'LineString') {
      svgPath = geoJSONToSVGPath(coordinates);
    } else if (geometry.getType() === 'MultiLineString') {
      svgPath = coordinates.map(geoJSONToSVGPath).join(' ');
    }

    console.log('Generated SVG Path:', svgPath);
    return svgPath;
  }

  // Calculate viewBox based on route coordinates
  const getViewBox = () => {
    if (route.length === 0) return "0 0 100 100";

    const allCoords = route.flatMap(obj => {
      const path = wkbToSvgPath(obj.geom);
      return path.match(/-?\d+(\.\d+)?/g).map(Number);
    });

    const minX = Math.min(...allCoords.filter((_, i) => i % 2 === 0));
    const minY = Math.min(...allCoords.filter((_, i) => i % 2 !== 0));
    const maxX = Math.max(...allCoords.filter((_, i) => i % 2 === 0));
    const maxY = Math.max(...allCoords.filter((_, i) => i % 2 !== 0));

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  };

  useEffect(() => {

    if (route.length > 0) {
      setRouteFlag(true);

      console.log("route", route);
    }
  }, [route])


  return (
    <Container>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
      {/* Same as */}
      <ToastContainer />
      <Form onSubmit={handleSubmit}>
        <Row xs={9} className="justify-content-center">
          <Col xs={3}>
            <Form.Group>
              <SelectControl
                name="id1"
                value={selectedIds.id1}
                onChange={handleChange}
                placeholder="Seleccionar Edificio 1..."
                options={buildings.map((building) => ({
                  value: building.building_id,
                  label: building.name,
                }))}
              />
            </Form.Group>
          </Col>
          <Col xs={3}>
            <Form.Group>
              <SelectControl
                name="id2"
                value={selectedIds.id2}
                onChange={handleChange}
                placeholder="Seleccionar Edificio 2..."
                options={buildings.map((building) => ({
                  value: building.building_id,
                  label: building.name,
                }))}
              />
            </Form.Group>
          </Col>
          <Col xs={3}>
            <Button type="submit">Obtener Ruta Corta</Button>
          </Col>
        </Row>
      </Form>
      {routeFlag === true &&
        (<div style={{ padding: '10px', border: '2px solid black', margin: '10px' }}>
          <svg id="svg" width="60%" height="40%" viewBox="-80.0 12.0 600 400">
            {
              route.map((obj, index) => (
                <g key={index}>
                  <path
                    d={wkbToSvgPath(obj.geom)}
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                  />
                </g>
              ))
            }
          </svg>
        </div>)
      }
    </Container>
  );
};

export default BuildingForm;
