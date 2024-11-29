const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false }, // Add this field
  // other fields...
});

module.exports = mongoose.model('Employer', employerSchema);
