import React from "react";
import { Container } from "react-bootstrap";

const Map = () => {
  return (
    <Container className="my-3" style={{maxHeight:"50rem", maxWidth:"50rem"}}>
      <div
        style={{ height: 0, paddingTop: "56.25%", position: "relative" }}
      >
        <iframe
          src="/map/index.html"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          title="QGIS2Web Map"
        />
      </div>
    </Container>
  );
};

export default Map;