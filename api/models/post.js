const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    description: { type: String },
    postlets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Postlet'
    }]
});

module.exports = mongoose.model('Post', postSchema);