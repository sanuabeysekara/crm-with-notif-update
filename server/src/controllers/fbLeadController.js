const axios = require('axios');
const Lead = require("../models/lead");
const Course = require("../models/course");
const Branch = require("../models/branch");
const Status = require("../models/status");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const FACEBOOK_PAGE_ACCESS_TOKEN = "EAAMhGWbcZCOgBOwz3HcaVRGGg0U1ZAucZBpZBeo1IoY4GaEiuCzokhi1WAis3ftqZAxYagHXSnuWJQMojP0020tkntVFZCdX45ZBIHZC3pOvusqAVEA58R0jDv9a9HiyxdpSSbIvEkY23D5oy37SFknPgur7ah9EswtaVR8CtEH2rJKUHu5Hz9dMBZAZCl";
//get all leads
async function getLeads(req, res) {
  // Facebook sends a GET request
  // To verify that the webhook is set up
  // properly, by sending a special challenge that
  // we need to echo back if the "verify_token" is as specified
  if (req.query["hub.verify_token"] === "CUSTOM_WEBHOOK_VERIFY_TOKEN") {
    res.send(req.query["hub.challenge"]);
    return;
  }
}

async function postLeads(req, res) {
  // Facebook will be sending an object called "entry" for "leadgen" webhook event
  if (!req.body.entry) {
    return res.status(500).send({ error: "Invalid POST data received" });
  }

  // Travere entries & changes and process lead IDs
  for (const entry of req.body.entry) {
    for (const change of entry.changes) {
      // Process new lead (leadgen_id)
      await processNewLead(change.value.leadgen_id);
    }
  }

  // Success
  res.send({ success: true });
}

async function processNewLead(leadId) {
  let response;

  try {
    // Get lead details by lead ID from Facebook API
    response = await axios.get(`https://graph.facebook.com/v18.0/${leadId}/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`);
  }
  catch (err) {
    // Log errors
    return console.warn(`An invalid response was received from the Facebook API:`, err.response.data ? JSON.stringify(err.response.data) : err.response);
  }

  // Ensure valid API response returned
  if (!response.data || (response.data && (response.data.error || !response.data.field_data))) {
    return console.warn(`An invalid response was received from the Facebook API: ${response}`);
  }

  // Lead fields
  const leadForm = {};

  // Extract fields
  for (const field of response.data.field_data) {
    // Get field name & value
    const fieldName = field.name;
    const fieldValue = field.values[0];

    // Store in lead array
    //leadForm.push(`${fieldName} : ${fieldValue}`);
    leadForm[fieldName] = fieldValue;

  }

  // Implode into string with newlines in between fields
  //const leadInfo = leadForm.join('\n');

  // Log to console
  //console.log('A new lead was received!\n', leadInfo);
  //const {full_name, email, phone_number, date_of_birth, course_you_are_looking_for} = leadForm;
  console.log('A new lead was received!\n', leadForm);
  const { full_name, email, phone_number, date_of_birth, course_you_are_looking_for } = leadForm;
  var student_id;
  try {
    const student = await Student.create({ name: full_name, dob: date_of_birth, contact_no: phone_number, email: email })
    console.log(student._id);
    console.log(student.name);
    student_id = student._id
  } catch (error) {
    console.log(error);

  }
  await addLead(student_id, course_you_are_looking_for);

  // Use a library like "nodemailer" to notify you about the new lead
  // 
  // Send plaintext e-mail with nodemailer
  // transporter.sendMail({
  //     from: `Admin <admin@example.com>`,
  //     to: `You <you@example.com>`,
  //     subject: 'New Lead: ' + name,
  //     text: new Buffer(leadInfo),
  //     headers: { 'X-Entity-Ref-ID': 1 }
  // }, function (err) {
  //     if (err) return console.log(err);
  //     console.log('Message sent successfully.');
  // });
}

async function addLead(student_id, course_you_are_looking_for) {

  //current datetime
  const currentDateTime = new Date();

  //check if student exist in student table
  if (!mongoose.Types.ObjectId.isValid(student_id)) {
    console.log("Error - No user added before adding the lead");
  }

  const course_doucument = await Course.findOne({ course_code: course_you_are_looking_for });
  if (!course_doucument) {
    console.lof("course not found");
  }


  var cid = null;

  const leastAllocatedCounselor = await getLeastAllocatedCounselor();

  if (leastAllocatedCounselor) {
    cid = leastAllocatedCounselor._id;
  } else {
    console.log("no counsellor");
  }

  try {
    const newLead = await Lead.create({
      date: currentDateTime,
      sheduled_at: currentDateTime,
      scheduled_to: null,
      course_id: course_doucument._id,
      branch_id: '657bfd4f2f17183fbd4da9d7',
      student_id: student_id,
      user_id: null,
      counsellor_id: cid,
      source_id: '65aae6856054f622e8f6ea41'
    });
  } catch (error) {
    console.log("Error adding leads:", error);
  }
}



async function getLeastAllocatedCounselor() {
  try {
    // Fetch all counselors (user_type with name 'Counselor')
    const counselorType = await User_type.findOne({ name: 'counselor' });
    const counselors = await User.find({ user_type: counselorType._id });

    // Fetch leads with counselors allocated
    const leadsWithCounselors = await Lead.find({ counsellor_id: { $exists: true } });

    // Count the number of leads each counselor has
    const counselorLeadCounts = counselors.map((counselor) => {
      const count = leadsWithCounselors.filter((lead) => lead.counsellor_id.equals(counselor._id)).length;
      return { counselor, count };
    });

    // Sort counselors by lead count in ascending order
    counselorLeadCounts.sort((a, b) => a.count - b.count);

    // Return the least allocated counselor
    return counselorLeadCounts[0].counselor;
  } catch (error) {
    console.error('Error fetching least allocated counselor:', error);
    throw error;
  }
}




module.exports = {
  getLeads,
  postLeads,
};
