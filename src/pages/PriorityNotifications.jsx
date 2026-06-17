import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, FormControl, InputLabel, MenuItem, Select, CircularProgress, Alert, Grid } from '@mui/material';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { logApiCall, logError, logInfo } from '../middleware/logger';

const defaultLimit = 10;
const allowedLimits = [10, 20, 50];

const fallbackNotifications = [
  { id: 1, type: 'Placement', message: 'Google placement drive tomorrow', timestamp: '2026-06-17 10:00:00' },
  { id: 2, type: 'Result', message: 'Semester results published', timestamp: '2026-06-16 15:30:00' },
  { id: 3, type: 'Event', message: 'Hackathon starts this weekend', timestamp: '2026-06-15 09:00:00' },
  { id: 4, type: 'Placement', message: 'Microsoft hiring for SDE Intern', timestamp: '2026-06-14 11:00:00' },
  { id: 5, type: 'Result', message: 'Project review results announced', timestamp: '2026-06-13 14:00:00' },
  { id: 6, type: 'Event', message: 'Tech Fest registrations open', timestamp: '2026-06-12 16:00:00' },
];

function PriorityNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [limit, setLimit] = useState(defaultLimit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('affordmed_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchPriorityNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      logApiCall('Fetch all notifications for priority inbox', { limit: 100, page: 1 });
      const response = await notificationService.getNotifications({ limit: 100, page: 1 });
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid notification response format');
      }
      const sorted = [...response.data]
        .map((notification) => ({
          ...notification,
          priorityScore: calculatePriorityScore(notification),
          parsedTimestamp: new Date(notification.timestamp || notification.created_at || notification.date || Date.now()),
        }))
        .sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) {
            return b.priorityScore - a.priorityScore;
          }
          return b.parsedTimestamp - a.parsedTimestamp;
        })
        .slice(0, limit);
      setNotifications(sorted);
      if (sorted.length === 0) {
        logInfo('Priority inbox returned empty list');
      }
    } catch (fetchError) {
      logError('Failed to load priority notifications, using fallback', fetchError);
      // Use fallback data when API fails. Calculate priority locally and apply limit.
      const sorted = [...fallbackNotifications]
        .map((notification) => ({
          ...notification,
          priorityScore: calculatePriorityScore(notification),
          parsedTimestamp: new Date(notification.timestamp || notification.created_at || notification.date || Date.now()),
        }))
        .sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) {
            return b.priorityScore - a.priorityScore;
          }
          return b.parsedTimestamp - a.parsedTimestamp;
        })
        .slice(0, limit);
      setNotifications(sorted);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPriorityNotifications();
  }, [fetchPriorityNotifications]);

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    logInfo('Priority inbox limit changed', { limit: event.target.value });
  };

  const handleNotificationClick = (notification) => {
    const id = notification.id?.toString() || notification._id?.toString();
    if (!id) {
      return;
    }
    if (!readIds.includes(id)) {
      const updatedReadIds = [...readIds, id];
      setReadIds(updatedReadIds);
      localStorage.setItem('affordmed_read_notifications', JSON.stringify(updatedReadIds));
      logInfo('Priority notification clicked', { notificationId: id, type: notification.notification_type || notification.type });
    }
  };

  const currentNotifications = useMemo(() => notifications, [notifications]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Notifications are ranked by weighted priority and recency.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="priority-limit-label">Top</InputLabel>
            <Select
              labelId="priority-limit-label"
              id="priority-limit"
              value={limit}
              label="Top"
              onChange={handleLimitChange}
            >
              {allowedLimits.map((option) => (
                <MenuItem key={option} value={option}>
                  {`Top ${option}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <NotificationList
            notifications={currentNotifications}
            readIds={readIds}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </Box>
    </Container>
  );
}

export default PriorityNotifications;
