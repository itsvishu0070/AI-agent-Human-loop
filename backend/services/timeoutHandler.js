import cron from "node-cron";
import HelpRequest from "../models/HelpRequest.js";

// Function to find and mark old pending requests as 'Unresolved'
const markUnresolvedRequests = async () => {
  console.log("🔄 Running timeout handler job...");

  try {
  
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await HelpRequest.updateMany(
      {
        status: "Pending", // Sirf pending requests
        createdAt: { $lt: twentyFourHoursAgo },
      },
      {
        $set: { status: "Unresolved" }, 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[TimeoutHandler] Marked ${result.modifiedCount} requests as Unresolved.`
      );
    } else {
      console.log("[TimeoutHandler] No old pending requests found.");
    }
  } catch (error) {
    console.error("[TimeoutHandler] Error updating requests:", error);
  }
};

const startTimeoutHandler = () => {

  cron.schedule("0 * * * *", markUnresolvedRequests);

  console.log(" Timeout handler scheduled. Will run every hour.");
};

export default startTimeoutHandler;
