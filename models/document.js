const mongoose = require("mongoose")

const documentScheme = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  viewCount:{
    type: Number,
    default: 0
  },
  expiresAt:{
    type: Date,
    default: null
  }
})

documentScheme.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Document", documentScheme)