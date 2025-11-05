import HelpRequest from "../models/HelpRequest.js";
import KnowledgeBase from "../models/KnowledgeBase.js";

/**
 * @desc    Create a new help request (called by AI Agent)
 * @route   POST /api/requests/create
 */
const createHelpRequest = async (req, res) => {
  try {
    const { customerId, question } = req.body;

    if (!customerId || !question) {
      return res
        .status(400)
        .json({ message: "customerId and question are required" });
    }

    // SIMULATE AI INTELLIGENCE: Check knowledge base first
    console.log(` AI Agent: Customer ${customerId} asks: "${question}"`);

    try {
      // Enhanced intelligent matching
      const questionLower = question.toLowerCase().trim();

      // 1. Look for exact match first
      let knownAnswer = await KnowledgeBase.findOne({
        question: { $regex: new RegExp(`^${questionLower}$`, "i") },
      });

      // 2. If no exact match, try semantic matching for common question patterns
      if (!knownAnswer) {
        // Normalize the question for better matching
        const normalizedQuestion = questionLower
          .replace(/do you (offer|have|provide|sell|do)/g, "do you offer")
          .replace(/what (are|is) your/g, "what are your")
          .replace(/when (are|do) you/g, "when are you")
          .replace(/how much (does|do|is|are)/g, "how much")
          .replace(/(what's|whats) your/g, "what are your")
          .replace(/(what's|whats) the (price|cost|pricing)/g, "how much")
          .replace(/extension/g, "extention") // Handle common typos
          .replace(/\?+$/, "?") // Normalize question marks
          .replace(/\s+/g, " ") // Normalize spaces
          .trim();

        // Try to find similar questions in knowledge base
        const allKnowledge = await KnowledgeBase.find({});

        for (const kb of allKnowledge) {
          const kbNormalized = kb.question
            .toLowerCase()
            .replace(/do you (offer|have|provide|sell|do)/g, "do you offer")
            .replace(/what (are|is) your/g, "what are your")
            .replace(/when (are|do) you/g, "when are you")
            .replace(/how much (does|do|is|are)/g, "how much")
            .replace(/(what's|whats) your/g, "what are your")
            .replace(/(what's|whats) the (price|cost|pricing)/g, "how much")
            .replace(/\?+$/, "?")
            .replace(/\s+/g, " ")
            .trim();

          // Check for semantic similarity
          if (kbNormalized === normalizedQuestion) {
            knownAnswer = kb;
            console.log(
              `AI Agent: Found semantic match! "${kb.question}" ≈ "${question}"`
            );
            break;
          }

          // Check for key phrase matches (hair extensions, hours, etc.)
          const questionKeywords = normalizedQuestion
            .split(" ")
            .filter((word) => word.length > 2);
          const kbKeywords = kbNormalized
            .split(" ")
            .filter((word) => word.length > 2);

          // More precise matching - require specific key terms to overlap
          const importantWords = [
            "hair",
            "extensions",
            "extention",
            "hours",
            "schedule",
            "open",
            "close",
            "time",
            "pricing",
            "price",
            "cost",
            "cancellation",
            "policy",
            "appointment",
            "booking",
          ];

          const questionImportantWords = questionKeywords.filter((word) =>
            importantWords.some(
              (important) =>
                word.includes(important) || important.includes(word)
            )
          );

          const kbImportantWords = kbKeywords.filter((word) =>
            importantWords.some(
              (important) =>
                word.includes(important) || important.includes(word)
            )
          );

          // Check if the main subject matches (e.g., both about hair extensions specifically)
          const questionSubject = questionImportantWords.join(" ");
          const kbSubject = kbImportantWords.join(" ");

          const subjectMatches =
            questionSubject.length > 0 &&
            kbSubject.length > 0 &&
            (questionSubject.includes(kbSubject) ||
              kbSubject.includes(questionSubject) ||
              (questionImportantWords.some((word) =>
                kbImportantWords.includes(word)
              ) &&
                questionImportantWords.length >= 2 &&
                kbImportantWords.length >= 2));

          if (subjectMatches) {
            knownAnswer = kb;
            console.log(
              `AI Agent: Found subject match! Question subject: "${questionSubject}" ≈ KB subject: "${kbSubject}"`
            );
            break;
          }
        }
      }

      if (knownAnswer) {
        console.log(` AI Agent: Found answer in knowledge base!`);
        console.log(
          ` CUSTOMER TEXT-BACK: Replying to ${customerId} about "${question}". Answer: "${knownAnswer.answer}"`
        );

        return res.status(200).json({
          message: "Question answered from knowledge base",
          aiResponse: true,
          customerId,
          question,
          answer: knownAnswer.answer,
        });
      }
    } catch (kbError) {
      console.error("Error checking knowledge base:", kbError);
    }

    console.log(`AI Agent: No answer found, escalating to supervisor...`);

    // Create a new pending request
    const newRequest = new HelpRequest({
      customerId,
      question,
      status: "Pending",
    });

    const savedRequest = await newRequest.save();

    // Simulate texting the supervisor
    console.log(
      `🔔 SUPERVISOR ALERT: New help request ${savedRequest._id}. Question: "${question}"`
    );

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating help request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all help requests (for Supervisor UI)
 * @route   GET /api/requests
 */
const getHelpRequests = async (req, res) => {
  try {
    // Check for status query (e.g., /api/requests?status=Pending)
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Find requests, sort by newest first
    const requests = await HelpRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
 
    console.error("Error getting help requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Submit a supervisor's answer
 * @route   POST /api/requests/:id/answer
 */
const submitSupervisorAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const requestId = req.params.id;

    if (!answer) {
      return res.status(400).json({ message: "Answer is required" });
    }

    // Find the request
    const request = await HelpRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Help request not found" });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "This request is already closed" });
    }

    // 1. Update the request
    request.status = "Resolved";
    request.answer = answer;
    request.resolvedAt = Date.now();
    const updatedRequest = await request.save();

    // 2. Simulate texting back the original caller
    console.log(
      `CUSTOMER TEXT-BACK: Replying to ${updatedRequest.customerId} about "${updatedRequest.question}". Answer: "${answer}"`
    );

    // 3. Update the Knowledge Base
    // Use findOneAndUpdate with 'upsert' to create new or update existing
    await KnowledgeBase.findOneAndUpdate(
      { question: updatedRequest.question }, // Find by question
      { answer: updatedRequest.answer }, // Set the new answer
      { upsert: true, new: true, runValidators: true } // Options
    );
    console.log(`KNOWLEDGE BASE: Updated with new answer.`);

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createHelpRequest, getHelpRequests, submitSupervisorAnswer };
