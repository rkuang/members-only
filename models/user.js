const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  f_name: { type: String, required: true },
  l_name: { type: String, required: true },
  membership_status: { type: Boolean, required: true, default: false }
})

module.exports = mongoose.model('User', UserSchema);
