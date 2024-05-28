import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Container } from "react-bootstrap";
import { fetchBuildings, getAcerasCercanas } from "../api/client";
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
      const result = await getAcerasCercanas(selectedIds.id1, selectedIds.id2);
      console.log(result); // Log the result
    } catch (error) {
      console.error("Error fetching aceras cercanas", error.message);
    }
  }

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
    </Container>

  );
};

export default BuildingForm;
