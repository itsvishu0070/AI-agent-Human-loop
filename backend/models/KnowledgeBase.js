import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema({
  
  question: {
    type: String,
    required: true,
    unique: true,
    sparse: true, 
  },

  
  answer: {
    type: String,
    required: true,
  },
});

knowledgeBaseSchema.index({ question: 1 });


export default mongoose.models.KnowledgeBase ||
  mongoose.model("KnowledgeBase", knowledgeBaseSchema);
