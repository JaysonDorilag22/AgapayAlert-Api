const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    address: {
      street: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      zipCode: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
    },
    phoneNo: {
      type: String,
      default: "",
    },
    current_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    preferred_notifications: {
      type: [String],
      enum: ["email", "sms", "push"],
      default: ["push"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verification: {
      code: {
        type: String,
        default: "",
      },
      expiresAt: {
        type: Date,
        default: Date.now,
        index: { expires: "1h" }, // Verification code expires in 1 hour
      },
      lastRequestedAt: {
        type: Date,
        default: Date.now,
      },
    },
    passwordReset: {
      token: {
        type: String,
        default: '',
      },
      expiresAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;