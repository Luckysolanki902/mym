// models/Like.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
    confessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Confession',
        required: true,
    },
    mid: {
        type: String,
        required: true,
    },
    timestamps: {
        type: Date,
        default: Date.now,
    },
});
mongoose.models = {}
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
