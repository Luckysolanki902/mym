// models/Like.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
    confessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Confession',
        required: true,
        index: true, // Add index for faster queries
    },
    mid: {
        type: String,
        required: true,
        index: true, // Add index if frequently queried
    },
}, { timestamps: true }); // Enable built-in timestamps


const Like =  mongoose.models.Like ||  mongoose.model('Like', likeSchema);

module.exports = Like;
