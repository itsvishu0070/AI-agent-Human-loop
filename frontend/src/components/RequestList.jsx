import React, { useState } from "react";
import { submitAnswer } from "../api/requestService";
import "./RequestList.css"; // Hum styling ke liye CSS file banayenge

const RequestList = ({ requests, onAnswerSubmit }) => {

  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState(null);

  // Jab supervisor answer type karta hai, toh yeh state update karega
  const handleAnswerChange = (requestId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [requestId]: value,
    }));
  };

  // Jab "Submit" button click hota hai
  const handleSubmit = async (e, requestId) => {
    e.preventDefault();
    const answer = answers[requestId];

    if (!answer || answer.trim() === "") {
      setError("Answer cannot be empty.");
      return;
    }

    setSubmittingId(requestId); // Disable button
    setError(null);

    try {
      await submitAnswer(requestId, answer);
      // Parent component (Dashboard) ko batayein ki data refresh karna hai
      onAnswerSubmit();
      // Input field ko clear karein
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [requestId]: "",
      }));
    } catch (err) {
      setError("Failed to submit answer. Please try again.");
      console.error(err);
    } finally {
      setSubmittingId(null); 
    }
  };

  if (requests.length === 0) {
    return <p>No pending requests found.</p>;
  }

  return (
    <div className="request-list">
      {error && <p className="error-message">{error}</p>}
      {requests.map((request) => (
        <div key={request._id} className="request-item">
          <div className="request-details">
            <p>
              <strong>Question:</strong> {request.question}
            </p>
            <p>
              <strong>From Customer:</strong> {request.customerId}
            </p>
            <p>
              <strong>Received:</strong>{" "}
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
          <form
            className="answer-form"
            onSubmit={(e) => handleSubmit(e, request._id)}
          >
            <textarea
              placeholder="Type your answer here..."
              value={answers[request._id] || ""}
              onChange={(e) => handleAnswerChange(request._id, e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submittingId === request._id} 
            >
              {submittingId === request._id ? "Submitting..." : "Submit Answer"}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
};

export default RequestList;
