const CounsellorAssignment = require('../models/counsellorAssignment')
const Lead = require('../models/lead')
const mongoose = require('mongoose')
const Notification = require("../models/notification");
const {emitNotification} = require("../service/notification");



async function assignLeadToCounsellor(req, res) {

  const { counsellor_id, lead_id } = req.body;
  try {
    const currentDateTime = new Date();
    if (!mongoose.Types.ObjectId.isValid(counsellor_id)) {
      res.status(404).json({ error: "No such counsellor" })
    }
    if (!mongoose.Types.ObjectId.isValid(lead_id)) {
      res.status(404).json({ error: "No such lead" })
    }
    else {
      console.log('notification was called')
      await sendNotificationToCounselor(
        counsellor_id,
        "You have a new lead."
      );
      console.log('notification was called after')

      const counsellorAssignment = await CounsellorAssignment.create({
        lead_id: lead_id,
        counsellor_id: counsellor_id,
        assigned_at: currentDateTime
      });
    
      res.status(200).json(counsellorAssignment);

      const lead = await Lead.findById(lead_id)

      // Update lead with assignment_id
      lead.assignment_id = counsellorAssignment._id;
      await lead.save();

      console.log("lead", lead)
      console.log("assignment", counsellorAssignment)
    }

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function sendNotificationToCounselor(counselorId, message) {
  console.log('notification was called')
  try {
    // Create a new notification
    const notification = await Notification.create({
      userId: counselorId,
      message: message,
      type:'success'
    });
    // Emit a socket event to notify the counselor
    emitNotification(counselorId, message);
    console.log(`Notification sent to counselor ${counselorId}: ${message}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

module.exports = {
  assignLeadToCounsellor
}
