import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import GitHubIcon from '@mui/icons-material/GitHub';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalBarIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                AI Pairing System
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              An AI-based explainable food and drink pairing system designed to recommend the perfect pairings
              based on flavor profiles and user preferences.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Navigation
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/pairing" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Pairing
            </Link>
            <Link component={RouterLink} to="/liquors" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Liquors
            </Link>
            <Link component={RouterLink} to="/ingredients" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Ingredients
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" sx={{ display: 'block', mb: 1 }}>
              About
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <Link href="https://github.com/gumwoo/ai-pairingsystem" color="inherit" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GitHubIcon sx={{ mr: 1 }} fontSize="small" />
              GitHub Repository
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              API Documentation
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          © {new Date().getFullYear()} AI Pairing System. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
