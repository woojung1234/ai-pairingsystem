import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFoundPage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          mt: 5,
          mb: 5
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            py: 5, 
            px: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            maxWidth: 600
          }}
        >
          <ErrorOutlineIcon color="primary" sx={{ fontSize: 100, mb: 2 }} />
          
          <Typography variant="h2" component="h1" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/"
              size="large"
            >
              Go to Home
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink}
              to="/pairing"
              size="large"
            >
              Try Pairing Tool
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default NotFoundPage;
