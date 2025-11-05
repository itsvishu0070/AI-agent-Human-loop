import { AccessToken } from "livekit-server-sdk";

export const generateToken = async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: "roomName and participantName are required",
      });
    }

    console.log(
      `Generating token for ${participantName} to join room: ${roomName}`
    );

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        name: participantName,
        // Add metadata to identify this as a customer
        metadata: JSON.stringify({
          role: "customer",
          joinTime: new Date().toISOString(),
        }),
      }
    );

    // Grant permissions for voice interaction
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Try both sync and async versions of toJwt
    let jwt;
    try {
      jwt = await token.toJwt();
    } catch (awaitError) {
     
      jwt = token.toJwt();
    }

  

    // Trigger voice agent processing
    if (global.onTokenGenerated) {
      global.onTokenGenerated(participantName, roomName);
    }

    res.json({
      token: jwt,
      url: process.env.LIVEKIT_URL,
      participantName,
      roomName,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
    });
  }
};
