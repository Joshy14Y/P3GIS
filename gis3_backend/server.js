require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Configure your PostgreSQL connection
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT, // Default port 5432 if not specified in .env
});

console.log(pool);

// Enable CORS for all routes
app.use(cors());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.get('/buildings', async (req, res) => {
  try {
    const result = await pool.query('SELECT building_id, name, geom FROM p2jjl.buildings ORDER BY building_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Server Error');
  }
});

// Endpoint to get aceras cercanas with dynamic parameters
app.get('/aceras-cercanas', async (req, res) => {
  const id1 = parseInt(req.query.id1, 10); // Parse id1 as a base-10 integer
  const id2 = parseInt(req.query.id2, 10); // Parse id2 as a base-10 integer

  if (isNaN(id1) || isNaN(id2)) {
    return res.status(400).send('Invalid parameters');
  }

  if (id1 === id2) {
    return res.status(400).send('IDs must not be equal');
  }

  try {
    const result = await pool.query('select sum(distancia), ST_AsSVG(st_transform(st_union(geom),5367)) FROM p2jjl.obtener_aceras_cercanas($1, $2)', [id1, id2]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});