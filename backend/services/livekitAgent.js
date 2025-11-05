import axios from "axios";
import KnowledgeBase from "../models/KnowledgeBase.js";


const FAKE_SALON_INFO = new Map();
FAKE_SALON_INFO.set(
  "hours",
  "We are open from 9 AM to 5 PM, Tuesday to Sunday."
);
FAKE_SALON_INFO.set("location", "We are located at 123 Main Street.");
FAKE_SALON_INFO.set("services", "We offer haircuts, coloring, and styling.");

async function findAnswer(question) {
  const lowerCaseQuestion = question.toLowerCase();

  for (const [key, answer] of FAKE_SALON_INFO.entries()) {
    if (lowerCaseQuestion.includes(key)) {
      return answer;
    }
  }

  try {
    const learnedAnswer = await KnowledgeBase.findOne({
      question: { $regex: new RegExp(lowerCaseQuestion, "i") },
    });

    if (learnedAnswer) {
      console.log(` Found learned answer in DB: "${learnedAnswer.answer}"`);
      return learnedAnswer.answer;
    }
  } catch (error) {
    console.error("Error querying KnowledgeBase:", error);
  }

  return null;
}


const simulateVoiceProcessing = async (participantIdentity, roomName) => {
  console.log(
    `🎤 Starting voice simulation for ${participantIdentity} in room ${roomName}`
  );

  
  const testQuestions = [
    "What are your hours?",
    "Where are you located?",
    "What services do you offer?",
    "Do you offer wedding packages?", // This will escalate
  ];

  let questionIndex = 0;

  const processNextQuestion = async () => {
    if (questionIndex >= testQuestions.length) {
      console.log("Voice demo simulation complete!");
      return;
    }

    const question = testQuestions[questionIndex];
    console.log(` Simulated user question: "${question}"`);

    const answer = await findAnswer(question);

    if (answer) {
      console.log(`AI Response: "${answer}"`);
      console.log(` Playing voice response to ${participantIdentity}`);
    } else {
      console.log("Question not found. Escalating to supervisor...");

      try {
        await axios.post("http://localhost:5000/api/requests/create", {
          customerId: participantIdentity,
          question: question,
        });
        console.log(" Successfully created pending request for supervisor");
      } catch (error) {
        console.error("Failed to create pending request:", error.message);
      }
    }

    questionIndex++;

    // Process next question after 5 seconds
    setTimeout(processNextQuestion, 5000);
  };

  // Start processing after 3 seconds
  setTimeout(processNextQuestion, 3000);
};


const startLiveKitAgent = () => {
  console.log("Starting LiveKit Agent...");

  try {
    console.log("LiveKit Agent is ready to process voice interactions");
    console.log(
      "For demo purposes, when a user joins a room, we'll simulate voice processing"
    );

    // For demo: Trigger processing when we detect a token generation
    global.onTokenGenerated = (participantName, roomName) => {
      console.log(
        `Token generated - preparing voice agent for ${participantName}`
      );
      setTimeout(() => {
        console.log(
          `Participant joined: ${participantName} in room: ${roomName}`
        );
        console.log(`Starting voice processing for ${participantName}`);
        simulateVoiceProcessing(participantName, roomName);
      }, 2000); 
    };


  } catch (error) {
    console.error("Error starting LiveKit agent:", error.message);
    console.log("Continuing with simplified voice processing for demo");
  }
};

export default startLiveKitAgent;
