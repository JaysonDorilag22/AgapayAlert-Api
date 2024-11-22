const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      relationship: 
      { 
        type: String, 
        enum: ["Parent", "Sibling","Relative", "Friend", "Spouse", "Child", "Colleague", "Other"], 
        required: true
      },
    },
    missingPerson: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      age: { type: Number, required: true },
      assignedSexAtBirth: { type: String, enum: ["Male", "Female"], required: true },
      scarsOrMarks: { type: String},
      prostheticsOrImplants: { type: String },
      lastKnownClothing: { type: String },
      lastKnownLocation: { type: String, required: true },
      lastSeen: { type: Date, required: true },
      causeOfDisappearance: { type: String, required: true },
      currentHairColor: { type: String},
      dyedHairColor: { type: Boolean, default: false },
      alias: { type: String },
      genderIdentity: { type: String },
      height: { type: String },
      weight: { type: String },
      raceOrNationality: { type: String },
      eyeColor: { type: String },
      wearsContactLenses: { type: Boolean, default: false },
      bloodType: { type: String },
      reward: { type: Number },
      images: [
        {
          public_id: { type: String, default: "", required: true }, 
          url: { type: String, default: "", required: true }, 
        },
      ],
      video: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      medication: { type: String },
      birthDefects: { type: String },
      contactNumber: { type: String },
      socialMediaAccount: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Solved"],
      default: "Pending",
      required: true,
    },
    category: {
      type: String,
      enum: ["Missing", "Abducted", "Wanted", "Hit and Run"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);