const mongoose = require('mongoose');
const Objective = require('./Objective');


const CycleSchema = new mongoose.Schema({
    owner: String,                  // entity that "owns" this, used for multi-tenant security
    title: String,
    description: String,
    objectives: [Objective.schema]
});
CycleSchema.virtual('id').get(function () { return this._id.toString(); });

module.exports = mongoose.models.Cycle || mongoose.model('Cycle', CycleSchema);