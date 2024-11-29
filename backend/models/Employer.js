const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Other existing fields...
  verified: { type: Boolean, default: false }, // New field for verification
});

module.exports = mongoose.model("Employer", employerSchema);
