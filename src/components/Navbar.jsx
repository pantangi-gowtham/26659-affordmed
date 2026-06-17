import React, { useEffect } from 'react';
import { AppBar, Box, Container, Toolbar, Typography, Button } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { logInfo } from '../middleware/logger';

const navLinks = [
  { label: 'All Notifications', to: '/' },
  { label: 'Priority Inbox', to: '/priority' },
];

function Navbar() {
  const location = useLocation();

  useEffect(() => {
    logInfo('Navigation event', { path: location.pathname });
  }, [location.pathname]);

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            AffordMed Notifications
          </Typography>
          <Box>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={NavLink}
                to={link.to}
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                  '&.active': {
                    fontWeight: '700',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
