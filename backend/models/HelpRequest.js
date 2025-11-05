import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
  {
    
    customerId: {
      type: String,
      required: true,
    },

    
    question: {
      type: String,
      required: true,
    },

    
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Resolved", "Unresolved"],
      default: "Pending",
    },

   
    answer: {
      type: String,
      default: null,
    },

    
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    
    timestamps: true,
  }
);


export default mongoose.models.HelpRequest || mongoose.model('HelpRequest', helpRequestSchema);
