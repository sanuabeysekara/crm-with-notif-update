import PropTypes from 'prop-types';
import { useState } from 'react';
import { useEffect } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Grid, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import EarningIcon from 'assets/images/icons/new.svg';

import config from '../../../config';

import { useAuthContext } from '../../../context/useAuthContext';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -85,
    right: -95,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    }
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    }
  }
}));

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const EarningCard = ({ isLoading }) => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const [data, setData] = useState([]);

  //fetch status details

  async function fetchStatusDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/followupsdate', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const getdata = await response.json();
      console.log(getdata);
      setData(getdata);
      // setIsTrue(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  useEffect(() => {
    if (user) {
      fetchStatusDetails();
    }
  }, []);

  console.log(data.NewCount);

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        backgroundColor: theme.palette.secondary[800],
                        mt: 1
                      }}
                    >
                      <img src={EarningIcon} alt="Notification" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>{data?.NewCount}</Typography>
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ mb: 1.25 }}>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#fff'
                  }}
                >
                  NEW
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

EarningCard.propTypes = {
  isLoading: PropTypes.bool
};

export default EarningCard;
