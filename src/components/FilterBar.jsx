import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const notificationTypes = ['', 'Placement', 'Result', 'Event'];

function FilterBar({ filterValue, onFilterChange }) {
  return (
    <FormControl fullWidth sx={{ minWidth: 200 }}> 
      <InputLabel id="notification-filter-label">Notification Type</InputLabel>
      <Select
        labelId="notification-filter-label"
        id="notification-filter"
        value={filterValue}
        label="Notification Type"
        onChange={(event) => onFilterChange(event.target.value)}
      >
        <MenuItem value="">All Types</MenuItem>
        {notificationTypes.filter((type) => type).map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

FilterBar.propTypes = {
  filterValue: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterBar;
