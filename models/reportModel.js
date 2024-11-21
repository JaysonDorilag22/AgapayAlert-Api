const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    missingPerson: {
      name: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      age: { type: Number, required: true },
      assignedSexAtBirth: { type: String, enum: ["Male", "Female"], required: true },
      scarsOrMarks: { type: String, required: true },
      prostheticsOrImplants: { type: String, required: true },
      lastKnownClothing: { type: String, required: true },
      lastKnownLocation: { type: String, required: true },
      lastSeen: { type: Date, required: true },
      causeOfDisappearance: { type: String, required: true },
      currentHairColor: {
        type: String,
        required: true,
      },
      alias: { type: String },
      genderIdentity: { type: String },
      height: { type: String },
      weight: { type: String },
      raceOrNationality: { type: String },
      eyeColor: { type: String },
      wearsContactLenses: { type: Boolean, default: false },
      bloodType: { type: String },
      images: [
        {
          public_id: { type: String, default: "" }, 
          url: { type: String, default: "" }, 
        },
      ],
      video: [
        {
          public_id: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      medication: { type: String },
      birthDefects: { type: String },
      contactNumber: { type: String },
      socialMediaAccount: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);