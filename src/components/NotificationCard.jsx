import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardActionArea, CardContent, Stack, Typography, Chip } from '@mui/material';

function NotificationCard({ notification, isRead, onClick }) {
  const title = notification.notification_type || notification.type || 'Unknown';
  const message = notification.message || notification.body || notification.text || 'No message available';
  const timestamp = notification.timestamp || notification.created_at || notification.createdAt || notification.date || 'Unknown time';

  return (
    <Card
      elevation={isRead ? 1 : 4}
      sx={{
        borderLeft: isRead ? '4px solid transparent' : '4px solid #1976d2',
        backgroundColor: isRead ? 'background.paper' : 'rgba(25, 118, 210, 0.06)',
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 1 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={1}>
            <Typography variant="h6" component="p">
              {title}
            </Typography>
            <Chip
              label={isRead ? 'Read' : 'Unread'}
              color={isRead ? 'default' : 'primary'}
              size="small"
            />
          </Stack>
          <Typography variant="body1" color="text.primary" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(timestamp).toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

NotificationCard.propTypes = {
  notification: PropTypes.object.isRequired,
  isRead: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

NotificationCard.defaultProps = {
  isRead: false,
};

export default NotificationCard;
