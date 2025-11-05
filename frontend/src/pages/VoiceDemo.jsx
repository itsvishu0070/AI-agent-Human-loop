import React, { useState, useEffect, useRef } from "react";
import { Room, RemoteParticipant, LocalParticipant } from "livekit-client";
import "./VoiceDemo.css";

// Unique ID generator to avoid duplicate keys
let messageIdCounter = 0;
const generateUniqueId = () => {
  messageIdCounter++;
  return `msg_${Date.now()}_${messageIdCounter}`;
};

const VoiceDemo = () => {
  const [room, setRoom] = useState(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [roomName, setRoomName] = useState("salon-demo-1762336523680");
  const [participantName, setParticipantName] = useState("Customer");
  const [messages, setMessages] = useState([]);
  const audioRef = useRef(null);

  const LIVEKIT_URL = "wss://frontdesk-assignment-m7ufqt86.livekit.cloud";

  // Manual demo function
  const startDemo = () => {
    setMessages([
      {
        id: generateUniqueId(),
        type: "system",
        text: 'Voice recognition started! Ask questions like: "What are your hours?", "Where are you located?", "What services do you offer?"',
        timestamp: new Date().toISOString(),
      },
    ]);

    // Start speech recognition
    startSpeechRecognition();
  };

  // Speech recognition instance ref
  const recognitionRef = useRef(null);

  // Speech recognition function
  const startSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          type: "system",
          text: " Speech recognition not supported in this browser. Please use Chrome or Edge.",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          type: "system",
          text: " Listening... Please speak now!",
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    recognition.onresult = async (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim();

      console.log(" User said:", transcript);

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          type: "user",
          text: transcript,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Show thinking message
      const thinkingId = generateUniqueId();
      setMessages((prev) => [
        ...prev,
        {
          id: thinkingId,
          type: "ai",
          text: "Thinking...",
          timestamp: new Date().toISOString(),
        },
      ]);

      // Process the question and get AI response
      try {
        const aiResponse = await getAIResponse(transcript);

        // Replace thinking message with actual response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  text: aiResponse,
                  timestamp: new Date().toISOString(),
                }
              : msg
          )
        );

        // Speak the AI response aloud
        if (window.speechSynthesis && aiResponse) {
          const utter = new window.SpeechSynthesisUtterance(aiResponse);
          utter.lang = "en-US";
          window.speechSynthesis.speak(utter);
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  text: "Sorry, I'm having trouble processing your question right now.",
                  timestamp: new Date().toISOString(),
                }
              : msg
          )
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      // Only show error message for actual errors, not normal aborts
      if (event.error !== "aborted") {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            type: "system",
            text: `Speech recognition error: ${event.error}. Click "Start Voice Demo" to try again.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      // Don't automatically restart - let user control when to start listening
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          type: "system",
          text: 'Voice recognition stopped. Click "Start Voice Demo" to continue.',
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    recognition.start();
  };

  // AI response function
  const getAIResponse = async (question) => {
    const lowerQuestion = question.toLowerCase();

    // Check for known questions first (these should NOT be escalated)
    if (
      lowerQuestion.includes("hours") ||
      lowerQuestion.includes("open") ||
      lowerQuestion.includes("time")
    ) {
      return "We are open from 9 AM to 5 PM, Tuesday to Sunday.";
    } else if (
      lowerQuestion.includes("location") ||
      lowerQuestion.includes("where") ||
      lowerQuestion.includes("address")
    ) {
      return "We are located in Delhi.";
    } else if (
      lowerQuestion.includes("services") &&
      lowerQuestion.includes("offer")
    ) {
      return "We offer haircuts, coloring, and styling.";
    } else if (
      lowerQuestion.includes("wedding") ||
      lowerQuestion.includes("package")
    ) {
      return "Yes, we do offer wedding packages.";
    } else {
      // Unknown question - escalate to supervisor
      try {
        console.log("Unknown question, escalating to supervisor:", question);
        console.log(
          "Making API call to:",
          "http://localhost:5000/api/requests/create"
        );

        const requestData = {
          customerId: participantName,
          question: question,
        };
        console.log("Request data:", requestData);

        const response = await fetch(
          "http://localhost:5000/api/requests/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (response.ok) {
          // Check if it was answered by AI or escalated
          if (responseData.aiResponse) {
            console.log(
              " AI found answer in knowledge base:",
              responseData.answer
            );
            return responseData.answer;
          } else {
            console.log("Successfully escalated to supervisor");
            return "That's a great question! I've forwarded it to my supervisor and they'll get back to you shortly. You can check the dashboard for updates.";
          }
        } else {
          console.error("API request failed:", responseData);
          return "That's a great question! Let me check with my supervisor and get back to you.";
        }
      } catch (error) {
        console.error("Error escalating to supervisor:", error);
        return "That's a great question! Let me check with my supervisor and get back to you.";
      }
    }
  };

  const generateToken = async () => {
    try {
      console.log("Requesting token from backend...");
      const response = await fetch("http://localhost:5000/api/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate token: ${response.status}`);
      }

      const data = await response.json();
      console.log("Token response received:", data);
      console.log("Raw token:", data.token);
      console.log("Token type:", typeof data.token);

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Handle case where token might be an object
      let actualToken = data.token;
      if (typeof data.token === "object") {
        console.log("Token is an object, trying to extract string value...");
        // If it's an object, try to get the string representation
        actualToken = JSON.stringify(data.token);
        console.log(
          "Converted token to string:",
          actualToken.substring(0, 50) + "..."
        );
      }

      console.log("Token extracted successfully");
      return actualToken;
    } catch (error) {
      console.error("Token generation error:", error);
      throw error;
    }
  };

  const connectToRoom = async () => {
    try {
      setConnectionStatus("connecting");
      console.log(" Starting connection to LiveKit room...");

      const token = await generateToken();
      console.log("Final token type:", typeof token);
      console.log("Final token length:", token ? token.length : "undefined");
      console.log(
        " Final token preview:",
        token && typeof token === "string"
          ? token.substring(0, 50) + "..."
          : "not a string"
      );

      const newRoom = new Room();

      // Set up event listeners
      newRoom.on("participantConnected", (participant) => {
        console.log("Participant connected:", participant.identity);
        setParticipants((prev) => [...prev, participant]);
      });

      newRoom.on("participantDisconnected", (participant) => {
        console.log("Participant disconnected:", participant.identity);
        setParticipants((prev) =>
          prev.filter((p) => p.identity !== participant.identity)
        );
      });

      newRoom.on("trackSubscribed", (track, publication, participant) => {
        console.log(" Audio track received from:", participant.identity);

        if (track.kind === "audio") {
          const audioElement = document.createElement("audio");
          audioElement.autoplay = true;
          audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
          document.body.appendChild(audioElement);
          console.log(" Playing AI voice response...");
        }
      });

      newRoom.on("connected", () => {
        console.log("Connected to LiveKit room successfully!");
        setConnected(true);
        setConnectionStatus("connected");
        console.log(" Ready for voice interaction - speak now!");

        // Show ready message
        setMessages([
          {
            id: generateUniqueId(),
            type: "system",
            text: 'Voice demo is ready! Click "Start Demo" to see sample conversation, or start speaking!',
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      newRoom.on("disconnected", () => {
        console.log("Disconnected from room");
        setConnected(false);
        setConnectionStatus("disconnected");
      });

      // Connect to the room
      console.log("Connecting to:", LIVEKIT_URL);
      await newRoom.connect(LIVEKIT_URL, token);
      setRoom(newRoom);

      // Enable audio by default
      await enableAudio(newRoom);
    } catch (error) {
      console.error(" Connection error:", error);
      setConnectionStatus("error");
    }
  };

  const enableAudio = async (currentRoom = room) => {
    try {
      if (!currentRoom) {
        console.error("Audio enable error: Room is not connected.");
        return;
      }
      if (!currentRoom.localParticipant) {
        console.error("Audio enable error: Local participant is undefined.");
        return;
      }
      await currentRoom.localParticipant.setMicrophoneEnabled(true);
      setAudioEnabled(true);
      console.log("Audio enabled");
      // Start speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          // Already started
        }
      }
    } catch (error) {
      console.error("Audio enable error:", error);
    }
  };

  const disableAudio = async () => {
    try {
      if (!room) {
        console.error("Audio disable error: Room is not connected.");
        return;
      }
      if (!room.localParticipant) {
        console.error("Audio disable error: Local participant is undefined.");
        return;
      }
      await room.localParticipant.setMicrophoneEnabled(false);
      setAudioEnabled(false);
      console.log("Audio disabled");
      // Stop speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Already stopped
        }
      }
    } catch (error) {
      console.error("Audio disable error:", error);
    }
  };

  const testQuestion = async (question) => {
    console.log(" Testing question:", question);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        type: "user",
        text: question,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Show thinking message
    const thinkingId = generateUniqueId();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        type: "ai",
        text: " Thinking...",
        timestamp: new Date().toISOString(),
      },
    ]);

    // Process the question and get AI response
    try {
      const aiResponse = await getAIResponse(question);

      // Replace thinking message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? { ...msg, text: aiResponse, timestamp: new Date().toISOString() }
            : msg
        )
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? {
                ...msg,
                text: "Sorry, I'm having trouble processing your question right now.",
                timestamp: new Date().toISOString(),
              }
            : msg
        )
      );
    }
  };

  const disconnect = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setConnected(false);
      setConnectionStatus("disconnected");
      setParticipants([]);
      setMessages([]);
    }
  };

  return (
    <div className="voice-demo">
      <div className="voice-demo-header">
        <h1>FrontDesk AI Voice Demo</h1>
        <p>Test the voice interaction with our AI assistant</p>
      </div>

      <div className="connection-section">
        <div className="room-config">
          <div className="input-group">
            <label>Room Name:</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={connected}
              placeholder="Enter room name"
            />
          </div>

          <div className="input-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              disabled={connected}
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="connection-controls">
          {!connected ? (
            <button
              className="connect-btn"
              onClick={connectToRoom}
              disabled={connectionStatus === "connecting"}
            >
              {connectionStatus === "connecting"
                ? "Connecting..."
                : "Join Voice Room"}
            </button>
          ) : (
            <button className="disconnect-btn" onClick={disconnect}>
              Leave Room
            </button>
          )}
        </div>

        <div className={`connection-status ${connectionStatus}`}>
          Status: {connectionStatus}
        </div>
      </div>

      {connected && (
        <div className="room-section">
          <div className="conversation-display">
            <h3>Voice Conversation</h3>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="waiting-message">
                  Listening for your voice... Speak now!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-header">
                      <span className="sender">
                        {message.type === "user"
                          ? " You"
                          : message.type === "ai"
                          ? "FrontDesk AI"
                          : "System"}
                      </span>
                      <span className="timestamp">
                        {message.timestamp
                          ? new Date(message.timestamp).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                    <div className="message-text">{message.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="audio-controls">
            <button
              className={`audio-btn ${audioEnabled ? "enabled" : "disabled"}`}
              onClick={() => {
                if (!room || !room.localParticipant) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: generateUniqueId(),
                      type: "system",
                      text: "Audio controls are unavailable. Please connect to the room before muting/unmuting.",
                      timestamp: new Date().toISOString(),
                    },
                  ]);
                  return;
                }
                if (audioEnabled) {
                  disableAudio();
                } else {
                  enableAudio();
                }
              }}
              disabled={!room || !room.localParticipant}
            >
              {audioEnabled ? "Mute" : "🔇 Unmute"}
            </button>

            <button className="demo-btn" onClick={startDemo}>
              Start Voice Recognition
            </button>
          </div>

          <div className="test-helpers">
            <p>
              <strong> Quick test questions:</strong>
            </p>
            <button onClick={() => testQuestion("What are your prices?")}>
               Ask about prices
            </button>
            <button onClick={() => testQuestion("Can I book an appointment?")}>
              Ask about booking
            </button>
            
          </div>

          <div className="participants">
            <h3>Participants ({participants.length + 1})</h3>
            <div className="participant-list">
              <div className="participant local">
                {participantName} (You) {audioEnabled ? "" : "🔇"}
              </div>
              {participants.map((participant) => (
                <div key={participant.identity} className="participant remote">
                   {participant.identity}
                </div>
              ))}
            </div>
          </div>

          <div className="demo-instructions">
            <div className="tips">
              <p>
                 <strong>How it works:</strong>
              </p>
              <ol>
                <li>
                   <strong>Join the room</strong> and enable your microphone
                </li>
                <li>
                  <strong>Ask a question</strong> clearly and wait for
                  response
                </li>
                <li>
                   <strong>AI responds instantly</strong> for known questions
                </li>
                <li>
                   <strong>Unknown questions</strong> get escalated to
                  supervisor (check Dashboard)
                </li>
                <li>
                   <strong>AI learns</strong> from supervisor answers for
                  future questions
                </li>
              </ol>
              <p>
                 <strong>Status:</strong> Voice agent is listening and ready
                to respond!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceDemo;
