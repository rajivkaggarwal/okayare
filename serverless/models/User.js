const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: String,            // identifer from Firebase Auth, also known as 'sub'
    email: String,          // email address as per Firebase Auth
    name: String,           // name as per Firebase Auth
    pictureUrl: String,     // url for picture as per Firebase Auth
    cycleIds: [{type: 'ObjectId', ref: 'Cycle'}]      // order of cycles as edited by this user (each User can have their own order)
});
UserSchema.virtual('id').get(function () { return this._id.toString(); });
UserSchema.virtual('cycleOrder').get(function () { return this.cycleIds.map(x => x.toString())})

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);