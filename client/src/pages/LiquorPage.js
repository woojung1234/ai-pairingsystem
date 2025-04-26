import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ClearIcon from '@mui/icons-material/Clear';

import { getLiquors, searchLiquors } from '../services/api';

function LiquorPage() {
  const [liquors, setLiquors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('');
  const [favorites, setFavorites] = useState([]);
  
  const liquorTypes = ['Whiskey', 'Vodka', 'Gin', 'Rum', 'Tequila', 'Brandy', 'Wine', 'Beer', 'Other'];
  
  const limit = 12; // Items per page
  
  useEffect(() => {
    fetchLiquors();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteLiquors');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [page, sortBy, filterType]);
  
  const fetchLiquors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // If there's a search query, use search endpoint
      if (searchQuery.trim()) {
        response = await searchLiquors(searchQuery);
        setLiquors(response.data);
        setTotalPages(1); // Search results are not paginated in this simplified version
      } else {
        // Otherwise fetch paginated and possibly filtered liquors
        response = await getLiquors(page, limit);
        setLiquors(response.data);
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error fetching liquors:', error);
      setError('Failed to fetch liquors. Please try again.');
      
      // Mock data for demonstration
      setLiquors([
        { 
          liquor_id: 1, 
          name: 'Bourbon Whiskey', 
          type: 'Whiskey',
          description: 'American whiskey distilled from corn mash, aged in new charred oak barrels.',
          origin: 'United States',
          alcohol_content: '40-50%',
          flavor_profile: ['Caramel', 'Vanilla', 'Oak', 'Spice'],
          image_url: '/images/bourbon.jpg' 
        },
        { 
          liquor_id: 2, 
          name: 'London Dry Gin', 
          type: 'Gin',
          description: 'Gin with predominant juniper flavor, distilled with botanical ingredients.',
          origin: 'United Kingdom',
          alcohol_content: '37.5-50%',
          flavor_profile: ['Juniper', 'Citrus', 'Herbs', 'Spice'],
          image_url: '/images/gin.jpg' 
        },
        { 
          liquor_id: 3, 
          name: 'Aged Rum', 
          type: 'Rum',
          description: 'Rum aged in oak barrels, resulting in a darker color and richer flavor.',
          origin: 'Caribbean',
          alcohol_content: '40-43%',
          flavor_profile: ['Molasses', 'Caramel', 'Vanilla', 'Tropical fruits'],
          image_url: '/images/rum.jpg' 
        },
        { 
          liquor_id: 4, 
          name: 'Single Malt Scotch', 
          type: 'Whiskey',
          description: 'Malted barley whisky made at a single distillery in Scotland.',
          origin: 'Scotland',
          alcohol_content: '40-60%',
          flavor_profile: ['Smoke', 'Peat', 'Honey', 'Oak'],
          image_url: '/images/scotch.jpg' 
        },
        { 
          liquor_id: 5, 
          name: 'Reposado Tequila', 
          type: 'Tequila',
          description: 'Tequila aged in oak barrels for 2-12 months.',
          origin: 'Mexico',
          alcohol_content: '38-40%',
          flavor_profile: ['Agave', 'Oak', 'Vanilla', 'Caramel'],
          image_url: '/images/tequila.jpg' 
        },
        { 
          liquor_id: 6, 
          name: 'Premium Vodka', 
          type: 'Vodka',
          description: 'Distilled multiple times for exceptional purity and smoothness.',
          origin: 'Russia',
          alcohol_content: '40%',
          flavor_profile: ['Neutral', 'Clean', 'Subtle sweetness'],
          image_url: '/images/vodka.jpg' 
        }
      ]);
      setTotalPages(3); // Mock 3 pages
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchLiquors();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(1); // Reset to first page
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilterType('');
    setPage(1);
  };
  
  const toggleFavorite = (liquorId) => {
    const newFavorites = favorites.includes(liquorId)
      ? favorites.filter(id => id !== liquorId)
      : [...favorites, liquorId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteLiquors', JSON.stringify(newFavorites));
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ mt: 4 }}>
        Explore Liquors
      </Typography>
      <Typography variant="subtitle1" align="center" paragraph sx={{ mb: 4 }}>
        Discover various spirits and learn about their flavor profiles
      </Typography>

      {/* Search and Filter Bar */}
      <Box 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2,
          alignItems: 'center'
        }}
      >
        <TextField
          label="Search Liquors"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearchQuery('');
                    if (!searchQuery) return;
                    fetchLiquors();
                  }}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-type-label">
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter By Type
          </InputLabel>
          <Select
            labelId="filter-type-label"
            id="filter-type"
            value={filterType}
            label="Filter By Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="">All Types</MenuItem>
            {liquorTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="sort-by-label">
            <SortIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Sort By
          </InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z-A)</MenuItem>
            <MenuItem value="type">Type</MenuItem>
            <MenuItem value="origin">Origin</MenuItem>
            <MenuItem value="alcohol_content">Alcohol Content</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          type="submit"
          sx={{ height: 56 }}
        >
          Search
        </Button>
        
        {(searchQuery || filterType || sortBy !== 'name') && (
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            sx={{ height: 56 }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Filters display */}
      {(searchQuery || filterType) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {searchQuery && (
            <Chip 
              label={`Search: ${searchQuery}`} 
              onDelete={() => {
                setSearchQuery('');
                fetchLiquors();
              }}
            />
          )}
          {filterType && (
            <Chip 
              label={`Type: ${filterType}`} 
              onDelete={() => {
                setFilterType('');
              }}
            />
          )}
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Grid */}
          {liquors.length > 0 ? (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {liquors.map((liquor) => (
                <Grid item key={liquor.liquor_id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea 
                      component={RouterLink}
                      to={`/liquors/${liquor.liquor_id}`}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={liquor.image_url || 'https://via.placeholder.com/300x140?text=No+Image'}
                        alt={liquor.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {liquor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Type: {liquor.type || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Origin: {liquor.origin || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {liquor.description ? 
                            (liquor.description.length > 100 
                              ? `${liquor.description.substring(0, 100)}...` 
                              : liquor.description) 
                            : 'No description available.'
                          }
                        </Typography>
                        
                        {liquor.flavor_profile && liquor.flavor_profile.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Flavor Profile:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {liquor.flavor_profile.map((flavor, index) => (
                                <Chip 
                                  key={index} 
                                  label={flavor} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                    
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(liquor.liquor_id);
                      }}
                    >
                      {favorites.includes(liquor.liquor_id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                my: 4, 
                py: 6, 
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <LocalBarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No liquors found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Try adjusting your search criteria or explore different categories.
              </Typography>
              <Button variant="contained" onClick={handleClearFilters}>
                View All Liquors
              </Button>
            </Box>
          )}
          
          {/* Pagination */}
          {liquors.length > 0 && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default LiquorPage;
