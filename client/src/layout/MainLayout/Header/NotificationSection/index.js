import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {formatDistanceToNow} from 'date-fns'

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  LinearProgress,
  Chip,
  List,
  Badge
} from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import config from '../../../../config';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import '../../../../assets/swal.css'
// assets
import { IconBell,IconAlarmPlus, IconAlarmMinus } from '@tabler/icons';

// sweet alert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ListItemWrapper = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  padding: 16,
  '&:hover': {
    background: theme.palette.primary.light
  },
  '& .MuiListItem-root': {
    padding: 0
  }
}));
// notification status options

import { useNotification } from '../../../../context/NotificationContext';
import io from 'socket.io-client';
import { useAuthContext } from '../../../../context/useAuthContext';
import { useLogout } from '../../../../hooks/useLogout';

// ==============================|| NOTIFICATION ||============================== //

const NotificationSection = () => {
  const theme = useTheme();

  

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notifications, addNotification } = useNotification();
  const {logout} = useLogout();
  const { user } = useAuthContext();
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    
  })

  const showSwal = () => {
    withReactContent(Toast).fire({
      icon: 'info',
      title: 'New Lead Assigned.'
    })
  }

  
  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);



  const fetchNotifications = async () => {
    try {
      console.log(user._id)
      const response = await fetch(config.apiUrl + `api/notifications/${user._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.ok) {
        const json = await response.json();
        // Initialize Formik values with lead data
        addNotification(json);
        console.log('Notification data:', json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else {
          console.error('Error fetching notification data:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching notification data:', error.message);
    } finally {
      console.log(loading)
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchNotifications();


    // Connect to the server with the userID as a query parameter
    const socket = io(config.apiUrl, {
      query: { userID: user._id },
    });

    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('notification', (data) => {
      console.log('Hook Notification received:', data);
      fetchNotifications();
      showSwal();
      // Handle the received notification data (e.g., update state)
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          ml: 2,
          mr: 3,
          [theme.breakpoints.down('md')]: {
            mr: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Avatar
            sx={{
              padding:'20px',
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&[aria-controls="menu-list-grow"],&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <Badge badgeContent={notifications.length?notifications.length:"0"} color="primary">
                <IconBell stroke={1.5} size="1.3rem" />
            </Badge>
          </Avatar>
        </ButtonBase>

      </Box>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  {
                    loading?( <LinearProgress />
                    ):(<></>)
                  }
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">All Notification</Typography>
                            <Chip
                              size="small"
                              label={notifications.length?notifications.length:"0"}
                              sx={{
                                color: theme.palette.background.default,
                                bgcolor: theme.palette.warning.dark
                              }}
                            />
                          </Stack>
                        </Grid>


                        <Grid item>
                          <div style={{width:'50px'}}></div>
                          {notifications.length?( <Typography sx={{marginLeft:'30px'}} component={Link} to="#" variant="subtitle2" color="primary"
                          onClick={ async () =>{
                            try {
                              setLoading(true); 
                              console.log(user._id)
                              const response = await fetch(config.apiUrl + `api/mark-all-as-read-notifications/${user._id}`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${user.token}` }
                              });
                  
                              if (response.ok) {
                              const json = await response.json();
                              // Initialize Formik values with lead data
                              addNotification(json);
                              console.log('Updated Notification data:', json);
                              } else {
                              if (res.status === 401) {
                                console.error('Unauthorized access. Logging out.');
                                logout();
                              } else {
                                console.error('Error fetching notification data:', response.statusText);
                              }
                              return;
                              }
                              } catch (error) {
                              console.error('Error fetching notification data:', error.message);
                              } finally {
                              console.log(loading)
                              setLoading(false);
                              }     
                        }}

                          
                          >
                            Mark as all read
                          </Typography>):(<></>)}
                         
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>
                        <Grid container direction="column" spacing={2}>
                        
                          <Grid item xs={12} p={0}>
                            <Divider sx={{ my: 0 }} />
                          </Grid>
                        </Grid>



                        <List
      sx={{
        width: '100%',
        maxWidth: 330,
        py: 0,
        borderRadius: '10px',
        [theme.breakpoints.down('md')]: {
          maxWidth: 300
        },
        '& .MuiListItemSecondaryAction-root': {
          top: 22
        },
        '& .MuiDivider-root': {
          my: 0
        },
        '& .list-container': {
          pl: 7
        }
      }}
    >


     {notifications.map((notification) => (
        <>
         <ListItemWrapper key={notification._id}>
        <ListItem alignItems="center">
          <ListItemAvatar>
          {notification.type === 'success' ? (
    <Avatar
      sx={{
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.success.light,
        border: 'none',
        borderColor: theme.palette.success.main
      }}
    >
      <IconAlarmPlus stroke={1.5} size="1.3rem" />
    </Avatar>
  ) : (
    <Avatar
      sx={{
        color: theme.palette.error.dark,
        backgroundColor: theme.palette.error.light,
        border: 'none',
        borderColor: theme.palette.error.main
      }}
    >
      <IconAlarmMinus stroke={1.5} size="1.3rem" />
    </Avatar>
  )}
            
           
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1">{notification.message}</Typography>} />
        </ListItem>
        <Grid container direction="column" className="list-container">
          <Grid item xs={12} sx={{ pb: 2 }}>
            <Typography variant="subtitle2">                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item>

           
    
    <Button variant="contained" color="primary"  onClick={async () => { 
            try {
            setLoading(true); 
            console.log(user._id)
            const response = await fetch(config.apiUrl + `api/mark-as-read-notifications/${notification._id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` }
            });

            if (response.ok) {
            const json = await response.json();
            // Initialize Formik values with lead data
            addNotification(json);
            console.log('Updated Notification data:', json);
            } else {
            if (res.status === 401) {
              console.error('Unauthorized access. Logging out.');
              logout();
            } else {
              console.error('Error fetching notification data:', response.statusText);
            }
            return;
            }
            } catch (error) {
            console.error('Error fetching notification data:', error.message);
            } finally {
            console.log(loading)
            setLoading(false);
            }      
            }}>
    Mark as read
  </Button>
  

              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </ListItemWrapper>
      <Divider />
        </>
      ))}
     
      
    </List>





                      </PerfectScrollbar>
                    </Grid>
                  </Grid>
               
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;
