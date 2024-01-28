const mongoose = require('mongoose')

const counsellorAssignmentSchema = new mongoose.Schema({
    lead_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Lead'},
    counsellor_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Counselor'},
    assigned_at: Date
})

const counsellorAssignment = mongoose.model('counsellorAssignment', counsellorAssignmentSchema)

module.exports = counsellorAssignment