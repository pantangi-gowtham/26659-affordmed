import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Pagination, CircularProgress, Alert, Grid } from '@mui/material';
import FilterBar from '../components/FilterBar';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService';
import { logApiCall, logError, logInfo } from '../middleware/logger';

const PAGE_SIZE = 10;

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('affordmed_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      logApiCall('Fetch notifications', { page, limit: PAGE_SIZE, notification_type: filterType || undefined });
      const response = await notificationService.getNotifications({ limit: PAGE_SIZE, page, notification_type: filterType || undefined });
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid notification response format');
      }
      setNotifications(response.data);
      const count = response.meta?.total || response.total || response.data.length;
      setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
      if (response.data.length === 0) {
        logInfo('Empty notifications response', { page, filterType });
      }
    } catch (fetchError) {
      logError('Failed to fetch notifications', fetchError);
      setError('Unable to load notifications. Please try again later.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleFilterChange = (value) => {
    setFilterType(value);
    setPage(1);
    logInfo('Filter changed', { filterType: value });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    logInfo('Page changed', { page: value });
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
      logInfo('Notification clicked', { notificationId: id, type: notification.notification_type || notification.type });
    }
  };

  const currentNotifications = useMemo(() => notifications, [notifications]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            All Notifications
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <FilterBar filterValue={filterType} onFilterChange={handleFilterChange} />
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      </Box>
    </Container>
  );
}

export default AllNotifications;
