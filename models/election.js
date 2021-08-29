const mongoose = require('mongoose')
const election = new mongoose.Schema({
    election_title:{
        type: String
    },
    election_description: {},
    courses: {
        type: Array
    },
    positions:{
        type: Array
    }, 
    candidates:{
        type: Array
    },
    partylist:{
        type: Array, 
        required: true
    },
    voters:{
        type: Array,
    },
    passcode: {
        type: String,
        required: true
    },
    status:{
        type: String,
    },
    start: {}, 
    end: {}, 
    created:{}
})
module.exports = mongoose.model('elections', election)