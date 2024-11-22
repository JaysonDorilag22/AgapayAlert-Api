const mongoose = require("mongoose");

const sightingSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    locationSeen: {
      type: String,
      required: true,
    },
    dateSeen: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    identificationId: {
      category: {
        type: String,
        enum: ["School ID", "Barangay ID", "Government ID"],
        required: true,
      },
      image: {
        public_id: { type: String, default: "", required: true },
        url: { type: String, default: "", required: true },
      },
    },
    images: [
      {
        public_id: { type: String, default: "", required: true },
        url: { type: String, default: "", required: true },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Process", "Resolved"],
      default: "Pending",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sighting", sightingSchema);