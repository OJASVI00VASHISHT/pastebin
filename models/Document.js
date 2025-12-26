const mongoose = require("mongoose")
const { nanoid } = require("nanoid")

const documentScheme = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  slug:{
    type: String,
    required : true,
    unique:true,
    default: ()=> nanoid(6)
  },
  viewCount:{
    type: Number,
    default: 0
  },
  expiresAt:{
    type: Date,
    default: null
  },
  isBurn:{
    type:Boolean,
    default: false
  }
})

documentScheme.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Document", documentScheme)
