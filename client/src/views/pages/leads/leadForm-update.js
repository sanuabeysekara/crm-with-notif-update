import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Alert, Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BroadcastOnPersonalIcon from '@mui/icons-material/BroadcastOnPersonal';
import { useEffect } from 'react';
import { useState } from 'react';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import PersonIcon from '@mui/icons-material/Person';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import LeadfollowUp from './leadFollowUp';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useLogout } from '../../../hooks/useLogout';

export default function LeadForm() {
  const [sid, setSid] = useState('');
  const { logout } = useLogout();
  const [changedFields, setChangedFields] = useState({});
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const theme = useTheme();
  const { user } = useAuthContext();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State variables for selected IDs

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [studentOptions, setStudentOptions] = useState([]);

  const [loading, setLoading] = useState(true); // Loading state

  const [statusForm, setStatusForm] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get('id');

  const [values, setValues] = useState({
    name: '',
    dob: '',
    email: '',
    nic: '',
    contact_no: '',
    address: '',
    date: formattedDate,
    scheduled_to: '',
    course: 'Select Course',
    branch: 'Select Branch',
    status: 'Select Status',
    comment: '',
    // updateDate: formattedDate,
    followupId: ''
  });

  const fetchLeadData = async () => {
    try {
      const response = await fetch(config.apiUrl + `api/leads/${leadId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.ok) {
        const json = await response.json();
        // Initialize Formik values with lead data
        setValues(json);
        setSid(json.student_id);
        console.log(json.name);

        console.log('Lead data:', json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else {
          console.error('Error fetching lead data:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching lead data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/courses', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setCourses(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else {
          console.error('Error fetching courses:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching courses:', error.message);
    }
  };
  const fetchBranches = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/branches', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setBranches(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else {
          console.error('Error fetching branches:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/status', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setStatuses(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else {
          console.error('Error fetching  status:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching status:', error.message);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchBranches();
    fetchStatuses();
    if (leadId) {
      setLoading(true);
      fetchLeadData();
    }
    const fetchStudents = async () => {
      try {
        const response = await fetch(config.apiUrl + `api/searchStudents`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (response.ok) {
          const students = await response.json();
          setStudentOptions(students);
          console.log('ok', studentOptions);
          console.log(students);
        } else {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else {
            console.error('Error fetching students:', response.statusText);
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching students:', error.message);
      }
    };
    fetchStudents();
  }, [values.name]);

  const handleUpdate = async (values, { setSubmitting, setFieldError }) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      if (
        changedFields.email != null ||
        changedFields.address != null ||
        changedFields.name != null ||
        changedFields.dob != null ||
        changedFields.contact_no != null
      ) {
        if (Object.keys(changedFields).length > 0) {
          console.log(changedFields);
          // Only send the changed fields to the server for update
          const updateStudentData = {
            ...changedFields
          };
          console.log(updateStudentData);
          console.log(sid);
          const updatestudent = await fetch(config.apiUrl + `api/students/${sid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify(updateStudentData)
          });

          if (!updatestudent.ok) {
            if (res.status === 401) {
              console.error('Unauthorized access. Logging out.');
              logout();
            }
            return;
          }
          console.log('only student updated');
        }
      }

      //update lead data
      if (changedFields.scheduled_to != null || selectedCourseId !== '' || selectedBranchId !== '') {
        console.log('first');

        const updateLeadData = {
          // scheduled_at: formattedDate
        };

        if (selectedCourseId != '') {
          updateLeadData.course_id = selectedCourseId;
        }
        if (selectedBranchId != '') {
          updateLeadData.branch_id = selectedBranchId;
        }
        if (changedFields.scheduled_to != null) {
          updateLeadData.scheduled_to = changedFields.scheduled_to;
          updateLeadData.scheduled_at = changedFields.scheduled_at;
        }
        console.log(changedFields);
        const updateLead = await fetch(config.apiUrl + `api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(updateLeadData)
        });
        if (!updateLead.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          }
          return;
        }
        console.log('only lead updated');
      }

      //followup add
      console.log(values.followupId);

      console.log('stsid', selectedStatusId);

      if (selectedStatusId != '' || changedFields.comment != null) {
        const updateFollowupData = {
          user_id: user?._id,
          lead_id: leadId
        };

        if (values.comment != '') {
          updateFollowupData.comment = values.comment;
        }
        if (selectedStatusId != '') {
          updateFollowupData.status = values.status;
        }

        const addFollowup = await fetch(config.apiUrl + `api/followUps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(updateFollowupData)
        });
        if (!addFollowup.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          }
          return;
        }
        console.log('update followup');
      }

      console.log('Data updated successfully!');
      navigate('/app/leads');
      setChangedFields({});
      setValues({
        name: '',
        dob: '',
        email: '',
        contact_no: '',
        address: '',
        date: formattedDate,
        scheduled_to: '',
        course: '',
        branch: '',
        status: '',
        comment: '',
        updateDate: formattedDate,
        followupId: ''
      });
    } catch (error) {
      console.error('Error during lead update:', error.message);
      setErrorMessage(error.message || 'Error updating lead');

      // Set formik errors
      setFieldError('submit', error.message);
    } finally {
      // Always set submitting to false, regardless of success or failure
      setSubmitting(false);
    }
  };

  return (
    <>
      <MainCard title="Update Lead">
        {!loading ? (
          <Formik
            initialValues={{
              name: values?.name || '',
              nic: values?.nic || '',
              address: values?.address || '',
              contact_no: values?.contact_no || '',
              email: values?.email || '',
              course: values?.course || '',
              date: values?.date || '',
              branch: values?.branch || '',
              dob: values?.dob || '',
              scheduled_to: values?.scheduled_to || ''
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              nic: Yup.string().required('NIC is required'),
              contact_no: Yup.string().required('Contact No is required'),
              email: Yup.string().required('Email is required'),
              course: Yup.string('Select Course').required('Course is required'),
              branch: Yup.string('Select Branch').required('Branch is required')
            })}
            onSubmit={handleUpdate}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <div>
                <form autoComplete="off" noValidate onSubmit={handleSubmit}>
                  <Grid container direction="column" justifyContent="center">
                    <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Name
                        </Typography>
                        <TextField
                          fullWidth
                          margin="normal"
                          name="name"
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.name}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          NIC
                        </Typography>
                        <TextField
                          fullWidth
                          margin="normal"
                          name="nic"
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.nic}
                          error={Boolean(touched.nic && errors.nic)}
                          helperText={touched.nic && errors.nic}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WidthFullIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Date of birth
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="dob"
                          type="date"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.dob}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Email
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="email"
                          type="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.email}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Contact Number
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="contact_no"
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.contact_no}
                          error={Boolean(touched.contact_no && errors.contact_no)}
                          helperText={touched.contact_no && errors.contact_no}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CallIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <Typography variant="h5" component="h5">
                          Address
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="address"
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.address}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HomeIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Date
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="date"
                          type="text"
                          disabled
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.date}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Scheduled To
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="scheduled_to"
                          type="date"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.scheduled_to}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventAvailableIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Select Course
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="course"
                          select
                          onChange={handleChange}
                          onBlur={handleBlur}
                          SelectProps={{ native: true }}
                          value={values.course}
                          error={Boolean(touched.course && errors.course)}
                          helperText={touched.course && errors.course}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AssignmentIcon />
                              </InputAdornment>
                            )
                          }}
                        >
                          {values.course == '' ? (
                            <option value="" disabled>
                              Select Course
                            </option>
                          ) : (
                            <></>
                          )}
                          {courses && courses.length > 0 ? (
                            courses.map((option) => (
                              <option key={option._id} value={option.name}>
                                {option.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No Courses available
                            </option>
                          )}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Select Branch
                        </Typography>
                        <TextField
                          fullWidth
                          // label="First Name"
                          margin="normal"
                          name="branch"
                          select
                          SelectProps={{ native: true }}
                          value={values.branch}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          error={Boolean(touched.branch && errors.branch)}
                          helperText={touched.branch && errors.branch}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BroadcastOnPersonalIcon />
                              </InputAdornment>
                            )
                          }}
                        >
                          {values.branch == '' ? (
                            <option value="" disabled>
                              Select Branch
                            </option>
                          ) : (
                            <></>
                          )}
                          {branches && branches.length > 0 ? (
                            branches.map((option) => (
                              <option key={option._id} value={option.name}>
                                {option.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No Branches available
                            </option>
                          )}
                        </TextField>
                      </Grid>

                      {leadId ? (
                        <Grid item xs={12} sm={12}>
                          <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                            <Button
                              style={{ borderColor: 'gray' }}
                              onClick={() => {
                                setStatusForm(true);
                              }}
                              variant="outlined"
                            >
                              <AddIcon style={{ color: 'black' }} />
                            </Button>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                      {statusForm == true ? (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h5" component="h5">
                              Select Status
                            </Typography>
                            <TextField
                              fullWidth
                              // label="First Name"
                              margin="normal"
                              name="status"
                              select
                              value={values.status}
                              SelectProps={{ native: true }}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <HourglassTopIcon />
                                  </InputAdornment>
                                )
                              }}
                            >
                              <option value="" disabled>
                                Select Status
                              </option>
                              {statuses && statuses.length > 0 ? (
                                statuses.map((option) => (
                                  <option key={option._id} value={option.name}>
                                    {option.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No Status available
                                </option>
                              )}
                            </TextField>
                          </Grid>

                          <Grid item xs={12} sm={12}>
                            <Typography variant="h5" component="h5">
                              Comment
                            </Typography>
                            <TextField
                              fullWidth
                              // label="First Name"
                              margin="normal"
                              name="comment"
                              type="text"
                              value={values.comment}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ChatBubbleIcon />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>

                    {successMessage && (
                      <>
                        <Divider sx={{ mt: 3, mb: 2 }} />
                        <Alert severity="success" sx={{ mt: 2 }}>
                          {successMessage}
                        </Alert>
                      </>
                    )}
                    {errorMessage && (
                      <>
                        <Divider sx={{ mt: 3, mb: 2 }} />
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {errorMessage}
                        </Alert>
                      </>
                    )}

                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="contained" type="submit" disabled={isSubmitting}>
                        Update Lead
                      </Button>
                    </CardActions>
                  </Grid>
                </form>
                {leadId ? (
                  <>
                    <LeadfollowUp selectedLeadId={leadId} />
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </Formik>
        ) : (
          <LinearProgress />
        )}
      </MainCard>
    </>
  );
}
