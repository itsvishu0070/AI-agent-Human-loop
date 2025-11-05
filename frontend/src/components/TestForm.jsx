import React, { useState } from "react";
import { submitTestRequest } from "../api/requestService";
import "./TestForm.css";

const TestForm = ({ onRequestCreated }) => {
  const [customerId, setCustomerId] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId.trim() || !question.trim()) {
      setError("Both fields are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await submitTestRequest(customerId, question);

      // Check if AI answered from knowledge base
      if (response.data.aiResponse) {
        setAiResponse({
          customer: response.data.customerId,
          question: response.data.question,
          answer: response.data.answer,
        });
      } else {
        // Normal flow - request created for supervisor
        if (onRequestCreated) {
          onRequestCreated();
        }
      }

      setCustomerId("");
      setQuestion("");
    } catch (err) {
      setError("Failed to create test request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-form">
      <h3>Create Test Request</h3>
      <p>Simulate a customer question for testing purposes</p>

      {error && <p className="error-message">{error}</p>}

      {aiResponse && (
        <div className="ai-response">
          <h4> AI Agent Responded Instantly!</h4>
          <p>
            <strong>Customer:</strong> {aiResponse.customer}
          </p>
          <p>
            <strong>Question:</strong> "{aiResponse.question}"
          </p>
          <p>
            <strong>AI Answer:</strong> "{aiResponse.answer}"
          </p>
          <p className="ai-note">
             Customer received instant answer from knowledge base!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerId">Customer ID:</label>
          <input
            type="text"
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="e.g., customer-001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="question">Question:</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Do you offer hair extensions?"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Test Request"}
        </button>
      </form>
    </div>
  );
};

export default TestForm;
