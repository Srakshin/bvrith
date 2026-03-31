import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Make it optional for backward compatibility
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  embedding: {
    type: [Number],
    select: false,
  },
});

import { generateEmbedding } from "../utils/ollamaUtils.js";

eventSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    try {
      const embedding = await generateEmbedding(this.title);
      if (embedding) this.embedding = embedding;
    } catch (error) {
      console.error("Failed to generate embedding for Event:", error);
    }
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
