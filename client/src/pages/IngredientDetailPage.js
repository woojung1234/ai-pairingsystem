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
  IconButton
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  LocalBar as LocalBarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { getIngredientById, getPairingScore } from '../services/api';

function IngredientDetailPage() {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState(null);
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if ingredient is in favorites
    const favorites = JSON.parse(localStorage.getItem('favoriteIngredients') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
    
    // Fetch ingredient details and pairings
    fetchIngredientDetails();
  }, [id]);

  const fetchIngredientDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch ingredient details
      const ingredientResponse = await getIngredientById(id);
      
      if (!ingredientResponse.success) {
        throw new Error('Failed to fetch ingredient details');
      }
      
      setIngredient(ingredientResponse.data);
      
      // In a real app, we would fetch pairings for this ingredient
      // For now, we'll use mock data
      setPairings([
        {
          liquor_id: 1,
          name: "Bourbon Whiskey",
          type: "Whiskey",
          score: 0.92,
          explanation: "The caramel and vanilla notes in bourbon complement the natural sweetness of this ingredient, while providing a pleasant contrast to its texture.",
          image_url: "/images/bourbon.jpg"
        },
        {
          liquor_id: 4,
          name: "Añejo Tequila",
          type: "Tequila",
          score: 0.85,
          explanation: "The oak-aged characteristics of añejo tequila create a harmonious balance with this ingredient's flavor profile, enhancing its natural qualities.",
          image_url: "/images/tequila.jpg"
        },
        {
          liquor_id: 7,
          name: "Dark Rum",
          type: "Rum",
          score: 0.77,
          explanation: "The rich, molasses sweetness of dark rum pairs well with this ingredient, creating a complex interplay of flavors with complementary notes.",
          image_url: "/images/rum.jpg"
        }
      ]);
      
    } catch (err) {
      console.error('Error fetching ingredient details:', err);
      setError('Failed to load ingredient details. Please try again.');
      
      // Set mock data for development
      setIngredient({
        ingredient_id: parseInt(id),
        name: "Apple",
        category: "Fruits",
        description: "Crisp and sweet fruit with varieties ranging from sweet to tart. Apples are versatile ingredients in both sweet and savory dishes, and can be used fresh or cooked.",
        flavor_profile: ["Sweet", "Tart", "Crisp", "Juicy"],
        image_url: "/images/apple.jpg"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteIngredients') || '[]');
    let newFavorites = [];
    
    if (isFavorite) {
      newFavorites = favorites.filter(item => item !== parseInt(id));
    } else {
      newFavorites = [...favorites, parseInt(id)];
    }
    
    localStorage.setItem('favoriteIngredients', JSON.stringify(newFavorites));
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

  if (error && !ingredient) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/ingredients"
          sx={{ mt: 2 }}
        >
          Back to Ingredients
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
        to="/ingredients"
        sx={{ mt: 3, mb: 1 }}
      >
        Back to Ingredients
      </Button>
      
      {/* Main content */}
      <Grid container spacing={4}>
        {/* Ingredient image and basic info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={ingredient.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
              alt={ingredient.name}
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
                {ingredient.name}
              </Typography>
              {ingredient.category && (
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
                  <CategoryIcon fontSize="small" />
                  {ingredient.category}
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
              {ingredient.flavor_profile && ingredient.flavor_profile.length > 0 ? (
                ingredient.flavor_profile.map((flavor, index) => (
                  <Chip
                    key={index}
                    label={flavor}
                    color="secondary"
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
          
          {/* Nutrition info - would be populated with real data in production */}
          <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Nutrition Information
            </Typography>
            {ingredient.category === 'Fruits' ? (
              <List dense>
                <ListItem>
                  <ListItemText primary="Calories" secondary="52 kcal per 100g" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Carbohydrates" secondary="14g per 100g" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Fiber" secondary="2.4g per 100g" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Vitamin C" secondary="4.6mg per 100g" />
                </ListItem>
              </List>
            ) : (
              <Typography color="text.secondary">
                Nutrition information not available for this ingredient.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Details and pairings section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About {ingredient.name}
            </Typography>
            {ingredient.description ? (
              <Typography paragraph>
                {ingredient.description}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                No description available for this ingredient.
              </Typography>
            )}
            
            {/* Culinary uses section - would be populated with real data in production */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Culinary Uses
            </Typography>
            <Typography paragraph>
              {ingredient.category === 'Fruits' ? 
                'This fruit can be enjoyed fresh, added to salads, used in baking, or incorporated into sauces and preserves. It pairs well with cinnamon, caramel, and vanilla in desserts, and can also add a sweet-tart element to savory dishes.' 
                : 'Culinary use information is not available for this ingredient.'}
            </Typography>
            
            {/* Seasonality section - would be populated with real data in production */}
            {ingredient.category === 'Fruits' || ingredient.category === 'Vegetables' ? (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Seasonality
                </Typography>
                <Typography paragraph>
                  {ingredient.category === 'Fruits' ? 
                    'This fruit is typically harvested in late summer through fall, with peak season from September to November in the Northern Hemisphere. For the best flavor and texture, look for firm fruits with bright, consistent coloring.' 
                    : 'Seasonality information is not available for this ingredient.'}
                </Typography>
              </>
            ) : null}
          </Paper>
          
          {/* Best pairings section */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Best Liquor Pairings
            </Typography>
            
            {pairings && pairings.length > 0 ? (
              <Grid container spacing={2}>
                {pairings.map((pairing) => (
                  <Grid item xs={12} key={pairing.liquor_id}>
                    <Card 
                      sx={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        transition: '0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardActionArea 
                        component={RouterLink}
                        to={`/liquors/${pairing.liquor_id}`}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'stretch',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: { xs: '100%', sm: 150 },
                            height: { xs: 140, sm: 'auto' }
                          }}
                          image={pairing.image_url || 'https://via.placeholder.com/150x150?text=No+Image'}
                          alt={pairing.name}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" component="div">
                                {pairing.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {pairing.type}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating 
                                value={pairing.score * 5} 
                                precision={0.5} 
                                readOnly 
                                size="small"
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {(pairing.score * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" paragraph>
                            <strong>Why it works: </strong>
                            {pairing.explanation}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No pairing recommendations available for this ingredient.
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
          </Paper>
          
          {/* Related ingredients section - would be populated with real data in production */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Ingredients
            </Typography>
            <Grid container spacing={2}>
              {['Pear', 'Quince', 'Peach'].map((name, index) => (
                <Grid item xs={4} key={index}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ height: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    <RestaurantIcon sx={{ mr: 1 }} />
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
            Want to discover more perfect combinations?
          </Typography>
          <Typography variant="body1">
            Find the ideal liquor to pair with any food or ingredient.
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

export default IngredientDetailPage;
