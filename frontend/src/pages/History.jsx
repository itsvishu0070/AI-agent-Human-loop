import React, { useState, useEffect } from "react";
import { getRequests } from "../api/requestService";
import "./History.css"; 

const History = () => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [unresolvedRequests, setUnresolvedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Dono tarah ke requests parallel mein fetch karein
        const [resolvedRes, unresolvedRes] = await Promise.all([
          getRequests("Resolved"),
          getRequests("Unresolved"),
        ]);
        setResolvedRequests(resolvedRes.data);
        setUnresolvedRequests(unresolvedRes.data);
      } catch (err) {
        setError("Failed to fetch history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history-page">
      {loading && <p>Loading history...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <section className="history-section">
            <h2>Resolved Requests ({resolvedRequests.length})</h2>
            {resolvedRequests.length === 0 ? (
              <p>No resolved requests found.</p>
            ) : (
              <div className="history-list">
                {resolvedRequests.map((req) => (
                  <div key={req._id} className="history-item resolved">
                    <p>
                      <strong>Question:</strong> {req.question}
                    </p>
                    <p>
                      <strong>Answer:</strong> {req.answer}
                    </p>
                    <p>
                      <strong>From:</strong> {req.customerId}
                    </p>
                    <p>
                      <strong>Resolved:</strong>{" "}
                      {new Date(req.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="history-section">
            <h2>Unresolved Requests ({unresolvedRequests.length})</h2>
            {unresolvedRequests.length === 0 ? (
              <p>No unresolved requests found.</p>
            ) : (
              <div className="history-list">
                {unresolvedRequests.map((req) => (
                  <div key={req._id} className="history-item unresolved">
                    <p>
                      <strong>Question:</strong> {req.question}
                    </p>
                    <p>
                      <strong>From:</strong> {req.customerId}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default History;
