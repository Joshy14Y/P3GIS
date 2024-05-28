import axios from "axios";

// Function to fetch buildings
export async function fetchBuildings() {
  try {
    const response = await axios.get('http://localhost:3000/buildings');
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching buildings', error.message);
    throw error; // Re-throw the error to handle it elsewhere
  }
}

// Function to fetch aceras cercanas
export async function getAcerasCercanas(id1, id2) {
  try {
    const response = await axios.get(`http://localhost:3000/aceras-cercanas?id1=${id1}&id2=${id2}`);
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching aceras cercanas', error.message);
    throw error; // Re-throw the error to handle it elsewhere
  }
}