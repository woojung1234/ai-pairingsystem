import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// Import API services
import { searchLiquors, searchIngredients, getPairingScore } from '../services/api';

function PairingPage() {
  // State for selected items
  const [selectedLiquor, setSelectedLiquor] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  
  // State for search options
  const [liquorOptions, setLiquorOptions] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  
  // Loading states
  const [isLiquorLoading, setIsLiquorLoading] = useState(false);
  const [isIngredientLoading, setIsIngredientLoading] = useState(false);
  const [isPairingLoading, setIsPairingLoading] = useState(false);
  
  // Result states
  const [pairingResult, setPairingResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Search inputs
  const [liquorInput, setLiquorInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');

  // Handle liquor search
  useEffect(() => {
    if (liquorInput === '') {
      setLiquorOptions([]);
      return;
    }
    
    setIsLiquorLoading(true);
    
    const fetchLiquors = async () => {
      try {
        const results = await searchLiquors(liquorInput);
        setLiquorOptions(results.data || []);
      } catch (error) {
        console.error('Error fetching liquors:', error);
        // Use mock data when API fails
        const mockResults = [
          { liquor_id: 1, name: 'Bourbon Whiskey' },
          { liquor_id: 2, name: 'Vodka' },
          { liquor_id: 3, name: 'Gin' },
          { liquor_id: 4, name: 'Rum' },
          { liquor_id: 5, name: 'Tequila' }
        ].filter(liquor => 
          liquor.name.toLowerCase().includes(liquorInput.toLowerCase())
        );
        
        setLiquorOptions(mockResults);
      } finally {
        setIsLiquorLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchLiquors();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [liquorInput]);

  // Handle ingredient search
  useEffect(() => {
    if (ingredientInput === '') {
      setIngredientOptions([]);
      return;
    }
    
    setIsIngredientLoading(true);
    
    const fetchIngredients = async () => {
      try {
        const results = await searchIngredients(ingredientInput);
        setIngredientOptions(results.data || []);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        // Use mock data when API fails
        const mockResults = [
          { ingredient_id: 1, name: 'Apple' },
          { ingredient_id: 2, name: 'Lemon' },
          { ingredient_id: 3, name: 'Chocolate' },
          { ingredient_id: 4, name: 'Vanilla' },
          { ingredient_id: 5, name: 'Cinnamon' }
        ].filter(ingredient => 
          ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
        );
        
        setIngredientOptions(mockResults);
      } finally {
        setIsIngredientLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchIngredients();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [ingredientInput]);

  // Handle get pairing
  const handleGetPairing = async () => {
    if (!selectedLiquor || !selectedIngredient) {
      setError('Please select both a liquor and an ingredient.');
      return;
    }
    
    setIsPairingLoading(true);
    setPairingResult(null);
    setError(null);
    
    try {
      // Call the actual API
      const result = await getPairingScore(selectedLiquor.liquor_id, selectedIngredient.ingredient_id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get pairing information');
      }
      
      // Format the data from the API response
      const formattedResult = {
        score: result.data.score,
        liquor: selectedLiquor,
        ingredient: selectedIngredient,
        reason: result.data.reason,
        shared_compounds: result.data.shared_compounds || [],
        compatibility_level: result.data.compatibility_level || 'good',
        flavor_notes: {
          liquor: selectedLiquor.flavor_profile || ['No flavor profile available'],
          ingredient: selectedIngredient.flavor_profile || ['No flavor profile available']
        }
      };
      
      setPairingResult(formattedResult);
    } catch (error) {
      console.error('Error getting pairing:', error);
      setError('Failed to get pairing information. Please try again.');
      
      // Use mock data for demo purposes when API fails
      const mockResult = {
        score: 0.85,
        liquor: selectedLiquor,
        ingredient: selectedIngredient,
        reason: "These pair well together because the caramel and vanilla notes in the bourbon complement the natural sweetness of the apple, while the spirit's oaky character provides a pleasant contrast to the fruit's crisp texture.",
        shared_compounds: ['Vanillin', 'Ethyl acetate', 'Methyl anthranilate'],
        compatibility_level: 'excellent',
        flavor_notes: {
          liquor: selectedLiquor.flavor_profile || ['Caramel', 'Vanilla', 'Oak', 'Spice'],
          ingredient: selectedIngredient.flavor_profile || ['Sweet', 'Tart', 'Crisp']
        }
      };
      
      setPairingResult(mockResult);
    } finally {
      setIsPairingLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSelectedLiquor(null);
    setSelectedIngredient(null);
    setLiquorInput('');
    setIngredientInput('');
    setPairingResult(null);
    setError(null);
  };

  // Get color based on compatibility level
  const getCompatibilityColor = (level) => {
    switch (level) {
      case 'excellent':
        return '#2e7d32'; // Green
      case 'good':
        return '#1976d2'; // Blue
      case 'moderate':
        return '#ed6c02'; // Orange
      case 'challenging':
        return '#d32f2f'; // Red
      default:
        return '#1976d2'; // Default blue
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ mt: 4 }}>
        Find Perfect Pairings
      </Typography>
      <Typography variant="subtitle1" align="center" paragraph sx={{ mb: 4 }}>
        Discover the best food and drink combinations with our AI-powered recommendation system.
      </Typography>

      {/* Search Form */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Autocomplete
              value={selectedLiquor}
              onChange={(event, newValue) => {
                setSelectedLiquor(newValue);
              }}
              inputValue={liquorInput}
              onInputChange={(event, newInputValue) => {
                setLiquorInput(newInputValue);
              }}
              options={liquorOptions}
              getOptionLabel={(option) => option.name}
              loading={isLiquorLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select a Liquor"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <LocalBarIcon color="primary" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {isLiquorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Autocomplete
              value={selectedIngredient}
              onChange={(event, newValue) => {
                setSelectedIngredient(newValue);
              }}
              inputValue={ingredientInput}
              onInputChange={(event, newInputValue) => {
                setIngredientInput(newInputValue);
              }}
              options={ingredientOptions}
              getOptionLabel={(option) => option.name}
              loading={isIngredientLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select an Ingredient"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {isIngredientLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              onClick={handleGetPairing}
              disabled={!selectedLiquor || !selectedIngredient || isPairingLoading}
              sx={{ height: '56px' }}
            >
              {isPairingLoading ? <CircularProgress size={24} color="inherit" /> : 'Find Pairing'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Results Section */}
      {pairingResult && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="div">
                Pairing Result
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" component="span" sx={{ mr: 1 }}>
                  Score:
                </Typography>
                <Rating 
                  value={pairingResult.score * 5} 
                  precision={0.5} 
                  readOnly 
                  sx={{ color: 'secondary.main' }}
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  ({(pairingResult.score * 100).toFixed(0)}%)
                </Typography>
              </Box>
            </Box>
            
            {/* Compatibility badge */}
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={`${pairingResult.compatibility_level?.charAt(0).toUpperCase()}${pairingResult.compatibility_level?.slice(1)} Compatibility`} 
                sx={{ 
                  backgroundColor: getCompatibilityColor(pairingResult.compatibility_level),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalBarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h5" component="div">
                        {pairingResult.liquor.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Flavor Profile:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {pairingResult.flavor_notes.liquor.map((note, index) => (
                        <Chip 
                          key={index}
                          label={note}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h5" component="div">
                        {pairingResult.ingredient.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Flavor Profile:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {pairingResult.flavor_notes.ingredient.map((note, index) => (
                        <Chip 
                          key={index}
                          label={note}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                <TipsAndUpdatesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Why this pairing works:
              </Typography>
              <Typography paragraph>
                {pairingResult.reason}
              </Typography>
            </Box>

            {pairingResult.shared_compounds && pairingResult.shared_compounds.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Shared Flavor Compounds:
                </Typography>
                <Box>
                  {pairingResult.shared_compounds.map((compound, index) => (
                    <Chip 
                      key={index}
                      label={compound}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleReset}>
                Try Another Pairing
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* How It Works Section */}
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 6, mb: 3 }}>
        How It Works
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold', color: 'primary.main' }}>1.</Box>
              Select Your Items
            </Typography>
            <Typography>
              Choose a liquor and an ingredient from our comprehensive database. You can search by name to quickly find what you're looking for.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold', color: 'primary.main' }}>2.</Box>
              AI Analysis
            </Typography>
            <Typography>
              Our AI model analyzes the chemical compounds, flavor profiles, and traditional pairings to determine compatibility and generate a score.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold', color: 'primary.main' }}>3.</Box>
              Explained Results
            </Typography>
            <Typography>
              View the pairing score and read a detailed explanation of why the combination works well, including shared flavor compounds and complementary notes.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PairingPage;
