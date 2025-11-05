import React, { useState, useEffect } from "react";
import RequestList from "../components/RequestList";
import TestForm from "../components/TestForm";
import { getRequests } from "../api/requestService";

const Dashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch pending requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRequests("Pending"); // Fetch only Pending requests
      setPendingRequests(res.data);
    } catch (err) {
      setError("Failed to fetch pending requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests when component mounts
  useEffect(() => {
    fetchPendingRequests();
  }, []);


  const handleAnswerSubmit = () => {
    fetchPendingRequests();
  };

  // This function will be called when a test request is created
  const handleTestRequestCreated = () => {
    fetchPendingRequests();
  };

  return (
    <div className="dashboard-page">
      <h2>Pending Supervisor Requests</h2>

      
      <TestForm onRequestCreated={handleTestRequestCreated} />

      {loading && <p>Loading requests...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <RequestList
          requests={pendingRequests}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
