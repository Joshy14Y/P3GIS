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

  const [route, setRoute] = useState("");
  const [routeFlag, setRouteFlag] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
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
      console.log('result', result); // Log the result
      setRoute(result[0].st_assvg);
    } catch (error) {
      console.error("Error fetching aceras cercanas", error.message);
    }
  }

  const createSVGFromRoute = (input) => {
    // Extract all the coordinates
    const coordinates = input.match(/-?\d+\.\d+/g).map(Number);

    // Separate x and y values
    const xValues = coordinates.filter((_, i) => i % 2 === 0);
    const yValues = coordinates.filter((_, i) => i % 2 !== 0);

    // Find the min and max values for x and y
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Calculate the width and height
    const width = maxX - minX;
    const height = maxY - minY;

    // Adjust the viewBox based on the zoom level
    const viewBoxWidth = 100 + (width / zoomLevel);
    const viewBoxHeight = 100 + (height / zoomLevel);
    const viewBox = `${minX - 20} ${minY - 10} ${viewBoxWidth} ${viewBoxHeight}`;

    // Create the SVG element
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="500" height="500">
        <path d="${input.trim()}" stroke="black" fill="none"/>
      </svg>
    `;
  };


  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom / 1.2, 0.1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => prevZoom * 1.2);
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

      {routeFlag && (
        <div style={{ width: '80vw', height: '80vh', justifyContent: 'center', alignItems: 'center', padding:'10px' }} >
          <div style={{border: '2px solid black', margin: '10px' }}>
            <div dangerouslySetInnerHTML={{ __html: createSVGFromRoute(route) }} />
          </div>
          <Button style={{ border: '2px solid black', margin: '10px' }} onClick={handleZoomIn}>Zoom In</Button>
          <Button style={{ border: '2px solid black', margin: '10px' }} onClick={handleZoomOut}>Zoom Out</Button>
        </div>
      )}

    </Container>
  );
};

export default BuildingForm;
