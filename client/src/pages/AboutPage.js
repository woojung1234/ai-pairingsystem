import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

function AboutPage() {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About AI Pairing System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          Learn about our mission to revolutionize the way people discover food and drink pairings
          through the power of artificial intelligence and data science.
        </Typography>
      </Box>

      {/* Main content */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            At AI Pairing, we believe that finding the perfect combination of food and drink should
            be an accessible, enjoyable experience for everyone—not just culinary experts.
          </Typography>
          <Typography paragraph>
            Our mission is to demystify the science of flavor pairing by combining cutting-edge AI technology
            with centuries of culinary wisdom, making it easy for anyone to discover incredible taste
            combinations that delight the senses.
          </Typography>
          <Typography paragraph>
            Whether you're a professional bartender, a home cook, or simply someone who enjoys good food
            and drink, our system provides personalized recommendations based on scientific analysis of
            flavor compounds, cultural traditions, and user preferences.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="/images/about-hero.jpg" // Would need an actual image
            alt="Cocktail pairing with food"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3
            }}
          />
        </Grid>
      </Grid>

      {/* How it Works Section */}
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          How Our Technology Works
        </Typography>
        <Typography align="center" paragraph sx={{ mb: 4 }}>
          AI Pairing is powered by our proprietary FlavorDiffusion model, combining graph neural networks
          with culinary expertise to create a robust recommendation system.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <ScienceIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Chemical Analysis
                </Typography>
                <Typography align="center">
                  Our system analyzes thousands of chemical compounds found in foods and beverages,
                  identifying shared elements that create harmony in flavor profiles.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <PsychologyIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Machine Learning
                </Typography>
                <Typography align="center">
                  Our AI model learns from traditional pairings, expert recommendations, and user
                  feedback to continuously improve its recommendations and explanations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <TipsAndUpdatesIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Explainable AI
                </Typography>
                <Typography align="center">
                  Unlike black-box systems, our technology provides clear explanations for
                  why certain pairings work, helping users learn and discover new combinations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Our Data Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Our Data
        </Typography>
        <Typography paragraph>
          The AI Pairing system is built on a comprehensive dataset including:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <DataObjectIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Chemical Compound Database" 
              secondary="Over 1,000 volatile compounds present in foods and beverages that contribute to aroma and flavor"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocalBarIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Extensive Spirits Catalog" 
              secondary="Detailed profiles of hundreds of liquors across all major categories, including regional variations"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Culinary Knowledge Base" 
              secondary="Traditional pairings from diverse culinary traditions around the world"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GroupsIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="User Preference Data" 
              secondary="Anonymized feedback and ratings that help our system learn from collective wisdom"
            />
          </ListItem>
        </List>

        <Typography paragraph sx={{ mt: 2 }}>
          All data is ethically sourced and curated by our team of food scientists, mixologists, and 
          AI researchers to ensure the highest quality recommendations.
        </Typography>
      </Box>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Our Team
        </Typography>
        <Typography paragraph sx={{ mb: 4 }}>
          AI Pairing is developed by a passionate team of researchers, engineers, and culinary experts
          committed to revolutionizing the world of flavor pairings.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-1.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                  Dr. Emily Chen
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chief Data Scientist
                </Typography>
                <Typography variant="body2">
                  PhD in Food Science with expertise in flavor compound analysis
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-2.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                  Michael Rodriguez
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lead Engineer
                </Typography>
                <Typography variant="body2">
                  Expert in AI systems and graph neural networks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-3.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                  Sofia Martinez
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Culinary Director
                </Typography>
                <Typography variant="body2">
                  Award-winning mixologist with expertise in global spirits
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-4.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                  Dr. James Wilson
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Research Lead
                </Typography>
                <Typography variant="body2">
                  Specializing in sensory science and flavor perception
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          mb: 8
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to discover amazing pairings?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          Start exploring our database of liquors and ingredients to find your perfect match.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          component={RouterLink}
          to="/pairing"
        >
          Try the Pairing Tool
        </Button>
      </Paper>

      {/* FAQ Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Frequently Asked Questions
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            How accurate are the recommendations?
          </Typography>
          <Typography paragraph>
            Our system achieves over 85% agreement with expert sommelier and mixologist recommendations in
            blind tests. The model is continuously improved based on user feedback and new research.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Can I use this for professional purposes?
          </Typography>
          <Typography paragraph>
            Absolutely! Many bartenders, chefs, and food industry professionals use our system to
            discover new combinations and expand their repertoire.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            How does the AI explain its recommendations?
          </Typography>
          <Typography paragraph>
            Our AI analyzes shared flavor compounds, flavor intensity, cultural traditions, and user
            preferences to generate explanations that are both scientifically accurate and easy to understand.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Do I need to create an account?
          </Typography>
          <Typography paragraph>
            You can use basic features without an account, but creating a free account allows you to save
            favorite pairings, get personalized recommendations, and contribute feedback.
          </Typography>
        </Box>
      </Box>

      {/* Contact Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Contact Us
        </Typography>
        <Typography paragraph>
          Have questions, suggestions, or feedback? We'd love to hear from you.
        </Typography>
        <Typography paragraph>
          Email: contact@aipairing.com
        </Typography>
        <Typography paragraph>
          Follow us on social media: @AIPairing
        </Typography>
      </Box>
    </Container>
  );
}

export default AboutPage;
