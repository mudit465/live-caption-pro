import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }

  },
  { timestamps: true }
);

export default mongoose.model("Transcript", transcriptSchema);