import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TextareaAutosize from '@mui/material/TextareaAutosize';
// import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import config from '../../../config';
import CodeIcon from '@mui/icons-material/Code';
import { Alert } from '@mui/material';
import { Field } from 'formik';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';

export default function CourseForm() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const { logout } = useLogout();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  // const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (courseId) {
          const res = await fetch(config.apiUrl + `api/courses/${courseId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (!res.ok) {
            if (res.status === 401) {
              console.error('Unauthorized access. Logging out.');
              logout();
            }
            return;
          }
          const data = await res.json();
          setCourseData(data);
          console.log('Course data:', data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    console.log('Submitting form with values:', values);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = {
      name: values.name,
      description: values.description,
      code: values.code
    };

    try {
      const url = courseId ? config.apiUrl + `api/course-form-update/${courseId}` : config.apiUrl + 'api/course-form-add-new';

      const method = courseId ? 'PUT' : 'POST';

      console.log('Submitting request to:', url);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }
        return;
      }

      console.log('Request complete.');
      const response = await res.json();
      console.log('Server response:', response);

      // Display success message
      setSuccessMessage(response.message || 'Changes saved successfully');
    } catch (error) {
      // Set error message
      console.error('Error submitting form:', error);
      setErrorMessage(error.message || 'Error submitting form');

      // Set formik errors
      setFieldError('submit', error.message);
    } finally {
      // Always set submitting to false, regardless of success or failure
      setSubmitting(false);
    }
  };

  return (
    <>
      <MainCard title={courseId ? 'Update Course' : 'Add New Course'}>
        <Formik
          enableReinitialize
          initialValues={{
            name: courseData?.name || '',
            description: courseData?.description || '',
            code: courseData?.course_code || ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            description: Yup.string().required('Description is required'),
            code: Yup.string().required('Course Code is required')
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form onSubmit={handleSubmit}>
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
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.name}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssignmentIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Course Code
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="code"
                      type="text"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.code}
                      error={Boolean(touched.code && errors.code)}
                      helperText={touched.code && errors.code}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="h5" component="h5">
                      Description
                    </Typography>
                    <Field name="description">
                      {({ field, meta }) => (
                        <>
                          <TextareaAutosize
                            minRows={8}
                            fullWidth
                            style={{ width: '100%', borderColor: theme.palette.main }}
                            margin="normal"
                            {...field}
                          />
                          {meta.touched && meta.error && (
                            <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{meta.error}</div>
                          )}
                        </>
                      )}
                    </Field>
                  </Grid>
                  <Divider />
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
                <Divider sx={{ mt: 3, mb: 2 }} />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" type="submit" disabled={isSubmitting}>
                    {courseId ? 'Update Course' : 'Add Course'}
                  </Button>
                </CardActions>
              </Grid>
            </form>
          )}
        </Formik>
      </MainCard>
    </>
  );
}
