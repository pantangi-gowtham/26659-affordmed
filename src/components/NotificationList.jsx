import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Grid } from '@mui/material';
import NotificationCard from './NotificationCard';

function NotificationList({ notifications, readIds, onNotificationClick }) {
  if (!notifications || notifications.length === 0) {
    return <Alert severity="info">No notifications available for this selection.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {notifications.map((notification) => {
        const id = notification.id?.toString() || notification._id?.toString() || ''; 
        return (
          <Grid item xs={12} key={id || notification.timestamp || Math.random()}>
            <NotificationCard
              notification={notification}
              isRead={Boolean(id && readIds.includes(id))}
              onClick={() => onNotificationClick(notification)}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  readIds: PropTypes.array.isRequired,
  onNotificationClick: PropTypes.func.isRequired,
};

export default NotificationList;
