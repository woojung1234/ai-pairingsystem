import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  LocalBar as LocalBarIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon,
  Room as RoomIcon,
  BarChart as BarChartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { getLiquorById, getRecommendations } from '../services/api';

function LiquorDetailPage() {
  const { id } = useParams();
  const [liquor, setLiquor] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if liquor is in favorites
    const favorites = JSON.parse(localStorage.getItem('favoriteLiquors') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
    
    // Fetch liquor details and recommendations
    fetchLiquorDetails();
  }, [id]);

  const fetchLiquorDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch liquor details
      const liquorResponse = await getLiquorById(id);
      
      if (!liquorResponse.success) {
        throw new Error('Failed to fetch liquor details');
      }
      
      setLiquor(liquorResponse.data);
      
      // Fetch recommendations for this liquor
      const recommendationsResponse = await getRecommendations(id);
      
      if (!recommendationsResponse.success) {
        throw new Error('Failed to fetch recommendations');
      }
      
      setRecommendations(recommendationsResponse.data.recommendations);
    } catch (err) {
      console.error('Error fetching liquor details:', err);
      setError('Failed to load liquor details. Please try again.');
      
      // Set mock data for development
      setLiquor({
        liquor_id: parseInt(id),
        name: "Bourbon Whiskey",
        type: "Whiskey",
        description: "American whiskey distilled from corn mash, aged in new charred oak barrels. Known for its rich, sweet flavor profile with notes of vanilla, caramel, and oak.",
        origin: "United States",
        alcohol_content: "40-50%",
        flavor_profile: ["Caramel", "Vanilla", "Oak", "Spice"],
        image_url: "/images/bourbon.jpg"
      });
      
      // Mock recommendations
      setRecommendations([
        {
          score: 0.92,
          ingredient: {
            ingredient_id: 1,
            name: "Apple",
            category: "Fruits",
            flavor_profile: ["Sweet", "Tart", "Crisp"],
            image_url: "/images/apple.jpg"
          }
        },
        {
          score: 0.85,
          ingredient: {
            ingredient_id: 3,
            name: "Cinnamon",
            category: "Spices",
            flavor_profile: ["Warm", "Sweet", "Spicy"],
            image_url: "/images/cinnamon.jpg"
          }
        },
        {
          score: 0.78,
          ingredient: {
            ingredient_id: 5,
            name: "Dark Chocolate",
            category: "Desserts",
            flavor_profile: ["Bitter", "Rich", "Sweet"],
            image_url: "/images/chocolate.jpg"
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteLiquors') || '[]');
    let newFavorites = [];
    
    if (isFavorite) {
      newFavorites = favorites.filter(item => item !== parseInt(id));
    } else {
      newFavorites = [...favorites, parseInt(id)];
    }
    
    localStorage.setItem('favoriteLiquors', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !liquor) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/liquors"
          sx={{ mt: 2 }}
        >
          Back to Liquors
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Back navigation */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/liquors"
        sx={{ mt: 3, mb: 1 }}
      >
        Back to Liquors
      </Button>
      
      {/* Main content */}
      <Grid container spacing={4}>
        {/* Liquor image and basic info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={liquor.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
              alt={liquor.name}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
              onClick={toggleFavorite}
            >
              {isFavorite ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {liquor.name}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1
                }}
              >
                <LocalBarIcon fontSize="small" />
                {liquor.type || 'Unknown type'}
              </Typography>
              {liquor.origin && (
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1 
                  }}
                >
                  <RoomIcon fontSize="small" />
                  {liquor.origin}
                </Typography>
              )}
              {liquor.alcohol_content && (
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1 
                  }}
                >
                  <BarChartIcon fontSize="small" />
                  {liquor.alcohol_content} ABV
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Flavor profile section */}
          <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Flavor Profile
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {liquor.flavor_profile && liquor.flavor_profile.length > 0 ? (
                liquor.flavor_profile.map((flavor, index) => (
                  <Chip
                    key={index}
                    label={flavor}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No flavor profile available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Details and tabs section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="liquor details tabs">
                <Tab label="Description" id="tab-0" />
                <Tab label="Recommended Pairings" id="tab-1" />
              </Tabs>
            </Box>
            
            {/* Description tab */}
            <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" sx={{ minHeight: 300 }}>
              {tabValue === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    About {liquor.name}
                  </Typography>
                  {liquor.description ? (
                    <Typography paragraph>
                      {liquor.description}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">
                      No description available for this liquor.
                    </Typography>
                  )}
                  
                  {/* Production process section - would be added with more detailed data */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Production Process
                  </Typography>
                  <Typography paragraph>
                    {liquor.type === 'Whiskey' ? 
                      'Whiskey production begins with mashing grains, followed by fermentation, distillation, and aging in wooden barrels. The specific process varies by region and style, with bourbon requiring at least 51% corn mash and aging in new charred oak barrels.' 
                      : 'The production process information is not available for this liquor.'}
                  </Typography>
                  
                  {/* Serving suggestions */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Serving Suggestions
                  </Typography>
                  <Typography paragraph>
                    {liquor.type === 'Whiskey' ? 
                      'This whiskey can be enjoyed neat, on the rocks, or in classic cocktails like an Old Fashioned or Manhattan. For the best tasting experience, serve in a Glencairn glass or a lowball tumbler at room temperature or with a single large ice cube.'
                      : 'Serving suggestions are not available for this liquor.'}
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Pairings tab */}
            <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ minHeight: 300 }}>
              {tabValue === 1 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Best Food Pairings
                  </Typography>
                  
                  {recommendations && recommendations.length > 0 ? (
                    <Grid container spacing={2}>
                      {recommendations.map((rec) => (
                        <Grid item xs={12} sm={6} md={4} key={rec.ingredient.ingredient_id}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              transition: '0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <CardActionArea 
                              component={RouterLink}
                              to={`/ingredients/${rec.ingredient.ingredient_id}`}
                              sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                            >
                              <CardMedia
                                component="img"
                                height="140"
                                image={rec.ingredient.image_url || 'https://via.placeholder.com/140x140?text=No+Image'}
                                alt={rec.ingredient.name}
                              />
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="div">
                                  {rec.ingredient.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    Pairing Score:
                                  </Typography>
                                  <Rating 
                                    value={rec.score * 5} 
                                    precision={0.5} 
                                    readOnly 
                                    size="small"
                                  />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {(rec.score * 100).toFixed(0)}%
                                  </Typography>
                                </Box>
                                {rec.ingredient.flavor_profile && rec.ingredient.flavor_profile.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      Flavor Profile:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {rec.ingredient.flavor_profile.map((flavor, idx) => (
                                        <Chip 
                                          key={idx} 
                                          label={flavor} 
                                          size="small" 
                                          color="secondary" 
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      No pairing recommendations available for this liquor.
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to="/pairing"
                    >
                      Try Custom Pairings
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
          
          {/* Related liquors section - would be populated with real data in production */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Liquors
            </Typography>
            <Grid container spacing={2}>
              {['Rye Whiskey', 'Scotch Whisky', 'Irish Whiskey'].map((name, index) => (
                <Grid item xs={4} key={index}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ height: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    <LocalBarIcon sx={{ mr: 1 }} />
                    {name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Call to action */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 4, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h6">
            Want to explore more perfect pairings?
          </Typography>
          <Typography variant="body1">
            Our AI can help you find the ideal combinations for any occasion.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary"
          component={RouterLink}
          to="/pairing"
          sx={{ minWidth: 200 }}
        >
          Try Our Pairing Tool
        </Button>
      </Paper>
    </Container>
  );
}

export default LiquorDetailPage;
