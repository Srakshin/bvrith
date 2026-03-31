import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "default",
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "archived", "trashed"],
      default: "active",
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        access: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],
    shareToken: {
      type: String,
      default: null,
    },
    shareTokenExpires: {
      type: Date,
      default: null,
    },
    embedding: {
      type: [Number],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ shareToken: 1 }, {
  unique: true,
  sparse: true,
  partialFilterExpression: {
    shareToken: { $ne: null }
  }
});

import { generateEmbedding } from "../utils/ollamaUtils.js";

noteSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isModified("content")) {
    try {
      const text = `${this.title} ${this.content || ""}`;
      const embedding = await generateEmbedding(text);
      if (embedding) this.embedding = embedding;
    } catch (error) {
      console.error("Failed to generate embedding for Note:", error);
    }
  }
  next();
});

export default mongoose.model("Note", noteSchema);
