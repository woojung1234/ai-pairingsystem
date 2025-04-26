import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Paper
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import PsychologyIcon from '@mui/icons-material/Psychology';

function HomePage() {
  const features = [
    {
      icon: <LocalBarIcon sx={{ fontSize: 40 }} />,
      title: "Comprehensive Liquor Database",
      description: "Explore our extensive collection of liquors from around the world, complete with detailed flavor profiles and origin information."
    },
    {
      icon: <FastfoodIcon sx={{ fontSize: 40 }} />,
      title: "Ingredient Matching",
      description: "Discover the perfect ingredients to pair with your favorite spirits, based on complementary flavor compounds and expert recommendations."
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "Explainable AI",
      description: "Understand why certain pairings work well together with our transparent AI system that explains the science behind each recommendation."
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('/images/hero-bg.jpg')`, // Would need to add an image
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
          }}
        >
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            Find Your Perfect Pairing
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Discover the best food and drink combinations with our AI-powered recommendation system.
            Based on flavor science and user preferences, we help you create memorable culinary experiences.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/pairing"
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        </Box>
      </Paper>

      {/* Features Section */}
      <Typography variant="h3" gutterBottom align="center" sx={{ mt: 8, mb: 4 }}>
        Our Features
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works Section */}
      <Typography variant="h3" gutterBottom align="center" sx={{ mt: 8, mb: 4 }}>
        How It Works
      </Typography>
      
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                1. Select a Liquor or Ingredient
              </Typography>
              <Typography paragraph>
                Start by choosing your favorite spirit or an ingredient you'd like to pair it with.
                Our system works either way - whether you're starting with a drink or a food item.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                2. Get AI-Powered Recommendations
              </Typography>
              <Typography paragraph>
                Our advanced AI model analyzes thousands of potential combinations, considering flavor
                compounds, traditional pairings, and user preferences to suggest the best matches.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                3. Understand the Science Behind Pairings
              </Typography>
              <Typography paragraph>
                Each recommendation comes with a detailed explanation of why these flavors work well
                together, helping you learn about flavor science while discovering new combinations.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src="/images/how-it-works.jpg" // Would need to add an image
              alt="How it works illustration"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          p: 6,
          borderRadius: 2,
          color: 'white',
          textAlign: 'center',
          mb: 8
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to discover amazing pairings?
        </Typography>
        <Typography variant="subtitle1" paragraph>
          Start exploring our database of liquors and ingredients to find your perfect match.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={RouterLink}
          to="/pairing"
          sx={{ mt: 2 }}
        >
          Try the Pairing Tool Now
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;
