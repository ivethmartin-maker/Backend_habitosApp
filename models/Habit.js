const mongoose = require('mongoose');
const habitSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    //-------------------- fin semana 1
    lastUpdate:{
        type: Date,
        default: Date.now
    },
    lastDone:{
        type: Date,
        default: Date.now
    },
    days:{
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Habit', habitSchema);
