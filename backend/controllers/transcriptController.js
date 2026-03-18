import Transcript from "../models/Transcript.js";

// Save transcript
export const saveTranscript = async (req, res) => {
  try {

    const { text, userId } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Transcript text is required"
      });
    }

    const transcript = new Transcript({
      text,
      userId
    });

    await transcript.save();

    res.status(201).json({
      message: "Transcript saved successfully",
      transcript
    });

  } catch (error) {
    res.status(500).json({
      message: "Error saving transcript",
      error: error.message
    });
  }
};

// Get transcripts
export const getTranscripts = async (req, res) => {
  try {

    const { userId } = req.query;

    let query = {};

    // If userId provided → show only that user's transcripts
    if (userId) {
      query.userId = userId;
    }

    const transcripts = await Transcript
      .find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(transcripts);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching transcripts",
      error: error.message
    });
  }
};

// Delete transcript
export const deleteTranscript = async (req, res) => {
  try {

    const { id } = req.params;

    await Transcript.findByIdAndDelete(id);

    res.json({
      message: "Transcript deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting transcript",
      error: error.message
    });
  }
};