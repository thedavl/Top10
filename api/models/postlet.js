const mongoose = require('mongoose');

const postletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    numbering: { type: Number, required: true },
    title: { type: String },
    description: { type: String },
    postId: { type:  mongoose.Schema.Types.ObjectId, ref: 'Post' }
})

module.exports = mongoose.model('Postlet', postletSchema);