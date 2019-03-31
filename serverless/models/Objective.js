const mongoose = require('mongoose');
const KeyResult = require('./KeyResult');

const ObjectiveSchema = new mongoose.Schema({
  title: String,
  description: String,
  keyResults: [KeyResult.schema]
});
ObjectiveSchema.virtual('id').get(function () { return this._id.toString(); });

module.exports = mongoose.models.Objective || mongoose.model('Objective', ObjectiveSchema);