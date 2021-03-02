const { Schema, model, Types } = require('mongoose');

//Schema constructor
const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  //add name + more details
  links: [{ type: Types.ObjectId, ref: 'Link' }]
})
module.exports = model('User', schema)