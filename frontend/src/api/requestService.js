import axios from "axios";

// Backend API ka URL. Hum isse .env file se lenge.
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/requests";

console.log(" API_URL configured as:", API_URL);

/**
 * Get all help requests.
 * @param {string} status - Optional status to filter by (e.g., 'Pending', 'Resolved')
 */
export const getRequests = async (status) => {
  let url = API_URL;
  if (status) {
    url += `?status=${status}`;
  }

  console.log("📡 Fetching requests from:", url);

  try {
    const response = await axios.get(url);
    console.log("API Response:", response.data);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw error;
  }
};

/**

 * @param {string} id - The ID of the help request
 * @param {string} answer - The answer text from the supervisor
 */
export const submitAnswer = async (id, answer) => {
  const url = `${API_URL}/${id}/answer`;
  console.log(" Submitting answer to:", url, { answer });

  try {
    const response = await axios.post(url, { answer });
    console.log("✅ Answer submitted:", response.data);
    return response;
  } catch (error) {
    console.error(" Submit Answer Error:", error);
    throw error;
  }
};

/**
 
 * @param {string} customerId - The customer ID
 * @param {string} question - The question text
 */
export const submitTestRequest = async (customerId, question) => {
  const url = `${API_URL}/create`;
  console.log("Creating test request:", url, { customerId, question });

  try {
    const response = await axios.post(url, { customerId, question });
    console.log("Test request created:", response.data);
    return response;
  } catch (error) {
    console.error("Test Request Error:", error);
    throw error;
  }
};


