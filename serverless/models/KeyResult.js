const mongoose = require('mongoose');
const KeyResultSchema = new mongoose.Schema({
  title: String,
  description: String
});
KeyResultSchema.virtual('id').get(function () { return this._id.toString(); });

module.exports = mongoose.models.KeyResult || mongoose.model('KeyResult', KeyResultSchema);