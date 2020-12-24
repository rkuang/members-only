const mongoose = require("mongoose");
const User = require('./user');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now() },
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Message', MessageSchema);
