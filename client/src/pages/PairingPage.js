import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  Autocomplete,
  useTheme,
  useMediaQuery,
  alpha,
  Zoom,
  Rating,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WineBarIcon from '@mui/icons-material/WineBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import LiquorIcon from '@mui/icons-material/Liquor';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';

function PairingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  // URL 쿼리 파라미터 파싱
  const queryParams = new URLSearchParams(location.search);
  const liquorIdParam = queryParams.get('liquorId');
  const ingredientIdParam = queryParams.get('ingredientId');

  // 상태 정의
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedLiquor, setSelectedLiquor] = useState(liquorIdParam ? Number(liquorIdParam) : null);
  const [selectedIngredient, setSelectedIngredient] = useState(ingredientIdParam ? Number(ingredientIdParam) : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pairingResults, setPairingResults] = useState([]);
  const [pairingExplanation, setPairingExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search'); // 'search' or 'results'

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 주류 데이터 가져오기
        const liquorsResponse = await axios.get('/api/liquors');
        
        // 재료 데이터 가져오기
        const ingredientsResponse = await axios.get('/api/ingredients');
        
        // 응답 데이터 구조 확인 및 변환
        const liquorsData = Array.isArray(liquorsResponse.data) 
          ? liquorsResponse.data 
          : (liquorsResponse.data.data || []);
          
        const ingredientsData = Array.isArray(ingredientsResponse.data) 
          ? ingredientsResponse.data 
          : (ingredientsResponse.data.data || []);
        
        setLiquors(liquorsData);
        setIngredients(ingredientsData);
        setLoading(false);
        
        // URL 파라미터가 있으면 자동 검색
        if (liquorIdParam || ingredientIdParam) {
          handleSearch();
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [liquorIdParam, ingredientIdParam]);

  // 주류 타입별 색상 매핑
  const getLiquorColor = (type) => {
    switch(type && type.toLowerCase()) {
      case '와인':
      case 'wine':
        return theme.palette.primary.main;
      case '위스키':
      case 'whisky':
      case 'whiskey':
        return '#c87137';
      case '맥주':
      case 'beer':
        return '#d4af37';
      case '소주':
      case 'soju':
        return '#a0a0a0';
      case '진':
      case 'gin':
        return '#6ca0ab';
      case '럼':
      case 'rum':
        return '#8b4513';
      case '데킬라':
      case 'tequila':
        return '#d4b55b';
      default:
        return theme.palette.secondary.main;
    }
  };

  // 주류 타입별 아이콘 매핑
  const getLiquorIcon = (type) => {
    switch(type && type.toLowerCase()) {
      case '와인':
      case 'wine':
        return <WineBarIcon />;
      case '위스키':
      case 'whiskey':
      case 'whisky':
        return <LiquorIcon />;
      case '맥주':
      case 'beer':
        return <LocalBarIcon />;
      default:
        return <WineBarIcon />;
    }
  };

  // 페어링 검색
  const handleSearch = async () => {
    if (!selectedLiquor && !selectedIngredient) {
      setError('주류 또는 재료를 선택해주세요.');
      return;
    }
    
    try {
      setSearching(true);
      setError(null);
      setPairingExplanation(null);
      
      // 페어링 추천 API 호출
      let response;
      if (selectedLiquor) {
        response = await axios.get(`/api/pairing/recommendations/${selectedLiquor}`);
      } else if (selectedIngredient) {
        // API 엔드포인트가 재료 ID로 검색하는 것을 지원하는지 확인 필요
        response = await axios.get(`/api/pairing/recommendations/ingredient/${selectedIngredient}`);
      }
      
      // 결과 처리
      const data = response.data;
      console.log('Pairing results:', data);
      
      setPairingResults(Array.isArray(data) ? data : []);
      setActiveView('results');
      setSearching(false);
      
      // URL 업데이트
      const params = new URLSearchParams();
      if (selectedLiquor) params.set('liquorId', selectedLiquor);
      if (selectedIngredient) params.set('ingredientId', selectedIngredient);
      navigate({ search: params.toString() });
      
    } catch (err) {
      setError('페어링 검색 중 오류가 발생했습니다.');
      setSearching(false);
      console.error('Error searching pairing:', err);
    }
  };

  // 페어링 설명 가져오기
  const fetchPairingExplanation = async (liquorId, ingredientId) => {
    try {
      const response = await axios.get(`/api/pairing/explanation/${liquorId}/${ingredientId}`);
      setPairingExplanation(response.data);
    } catch (err) {
      console.error('Error fetching pairing explanation:', err);
    }
  };

  // 선택된 주류 변경 처리
  const handleLiquorChange = (event, newValue) => {
    setSelectedLiquor(newValue ? newValue.id : null);
    if (activeView === 'results') {
      setPairingResults([]);
      setActiveView('search');
    }
  };

  // 선택된 재료 변경 처리
  const handleIngredientChange = (event, newValue) => {
    setSelectedIngredient(newValue ? newValue.id : null);
    if (activeView === 'results') {
      setPairingResults([]);
      setActiveView('search');
    }
  };

  // 검색 필드 클리어
  const handleClearSearch = () => {
    setSelectedLiquor(null);
    setSelectedIngredient(null);
    setSearchQuery('');
    setPairingResults([]);
    setActiveView('search');
    navigate('/pairing');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Header Section */}
      <Box
        sx={{
          position: 'relative',
          py: 12,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          overflow: 'hidden',
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/pairing-header-bg.jpg)', // 주류와 음식 이미지
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.15)',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Box textAlign="center">
                <Fade in={true} timeout={800}>
                  <Typography
                    variant="h1"
                    component="h1"
                    color="white"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    완벽한 페어링 찾기
                  </Typography>
                </Fade>
                
                <Fade in={true} timeout={1000}>
                  <Typography
                    variant="h6"
                    color="white"
                    sx={{
                      mb: 5,
                      maxWidth: 700,
                      mx: 'auto',
                      lineHeight: 1.8,
                      opacity: 0.9,
                    }}
                  >
                    좋아하는 주류나 음식을 선택하면 AI가 최적의 페어링을 추천해 드립니다.
                    과학적 분석과 전문가의 지식을 기반으로 한 맞춤형 추천을 경험해보세요.
                  </Typography>
                </Fade>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Fade in={true} timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              position: 'relative',
              top: -50,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  id="liquor-select"
                  options={liquors}
                  getOptionLabel={(option) => option.name || ''}
                  value={liquors.find(l => l.id === selectedLiquor) || null}
                  onChange={handleLiquorChange}
                  disabled={searching}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="주류 선택"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Box sx={{ color: theme.palette.primary.main, mr: 1 }}>
                              <WineBarIcon />
                            </Box>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ mr: 2, color: getLiquorColor(option.type) }}>
                        {getLiquorIcon(option.type)}
                      </Box>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.type} {option.alcoholContent && `| ${option.alcoholContent}%`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Autocomplete
                  id="ingredient-select"
                  options={ingredients}
                  getOptionLabel={(option) => option.name || ''}
                  value={ingredients.find(i => i.id === selectedIngredient) || null}
                  onChange={handleIngredientChange}
                  disabled={searching}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="재료 선택"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Box sx={{ color: theme.palette.primary.main, mr: 1 }}>
                              <RestaurantIcon />
                            </Box>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ mr: 2, color: theme.palette.primary.main }}>
                        <RestaurantIcon />
                      </Box>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        {option.category && (
                          <Typography variant="body2" color="text.secondary">
                            {option.category}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={searching || (!selectedLiquor && !selectedIngredient)}
                    fullWidth
                    sx={{
                      height: 56,
                      boxShadow: '0 4px 12px rgba(138, 36, 39, 0.25)',
                    }}
                    startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  >
                    {searching ? '검색 중...' : '검색'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearSearch}
                    disabled={searching}
                    sx={{
                      height: 56,
                      minWidth: 'auto',
                      p: 0,
                      width: 56,
                    }}
                  >
                    <ShuffleIcon />
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Paper>
        </Fade>
        
        {/* Results Section */}
        {activeView === 'results' && (
          <Box mt={4}>
            <Fade in={true} timeout={800}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{ fontWeight: 600 }}
                  >
                    페어링 결과
                  </Typography>
                  
                  <Button
                    variant="text"
                    color="secondary"
                    onClick={handleClearSearch}
                    sx={{ fontWeight: 500 }}
                  >
                    새 검색
                  </Button>
                </Box>
                
                {/* Selected Item Info */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 4,
                    backgroundColor: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    {selectedLiquor && (
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              mr: 2,
                            }}
                          >
                            <WineBarIcon fontSize="large" />
                          </Box>
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              선택한 주류
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                              {liquors.find(l => l.id === selectedLiquor)?.name || '알 수 없음'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedIngredient && (
                      <Grid item xs={12} md={selectedLiquor ? 6 : 12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              mr: 2,
                            }}
                          >
                            <RestaurantIcon fontSize="large" />
                          </Box>
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              선택한 재료
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                              {ingredients.find(i => i.id === selectedIngredient)?.name || '알 수 없음'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
                
                {/* Pairing Results Cards */}
                {pairingResults.length > 0 ? (
                  <Grid container spacing={3}>
                    {pairingResults.map((result, index) => {
                      const isLiquor = selectedLiquor ? false : true;
                      const itemId = isLiquor ? result.liquorId : result.ingredientId;
                      const itemType = isLiquor ? 'liquor' : 'ingredient';
                      const itemName = isLiquor 
                        ? liquors.find(l => l.id === result.liquorId)?.name 
                        : ingredients.find(i => i.id === result.ingredientId)?.name;
                      const itemCategory = isLiquor
                        ? liquors.find(l => l.id === result.liquorId)?.type
                        : ingredients.find(i => i.id === result.ingredientId)?.category;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={500 + (index * 100)}>
                            <Card 
                              sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                }
                              }}
                            >
                              <Box 
                                sx={{ 
                                  position: 'relative',
                                  height: 200,
                                  backgroundColor: alpha(isLiquor ? theme.palette.primary.main : theme.palette.secondary.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Box 
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    backgroundColor: alpha(isLiquor ? theme.palette.primary.main : theme.palette.secondary.main, 0.2),
                                    color: isLiquor ? theme.palette.primary.main : theme.palette.secondary.main,
                                  }}
                                >
                                  {isLiquor ? (
                                    getLiquorIcon(liquors.find(l => l.id === result.liquorId)?.type)
                                  ) : (
                                    <RestaurantIcon sx={{ fontSize: 40 }} />
                                  )}
                                </Box>
                                
                                {result.score && (
                                  <Box 
                                    sx={{ 
                                      position: 'absolute',
                                      top: 16,
                                      right: 16,
                                      display: 'flex',
                                      alignItems: 'center',
                                      backgroundColor: alpha(theme.palette.secondary.main, 0.9),
                                      color: '#121212',
                                      borderRadius: 8,
                                      px: 1.5,
                                      py: 0.5,
                                      fontWeight: 600,
                                    }}
                                  >
                                    <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {(result.score * 5).toFixed(1)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Typography 
                                  variant="h5" 
                                  component="h3" 
                                  gutterBottom
                                  sx={{ fontWeight: 600 }}
                                >
                                  {itemName || '알 수 없음'}
                                </Typography>
                                
                                {itemCategory && (
                                  <Chip 
                                    label={itemCategory} 
                                    size="small"
                                    sx={{ 
                                      mb: 2,
                                      backgroundColor: alpha(isLiquor ? theme.palette.primary.main : theme.palette.secondary.main, 0.1),
                                      color: isLiquor ? theme.palette.primary.main : theme.palette.secondary.main,
                                      fontWeight: 500,
                                    }}
                                  />
                                )}
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {result.explanation || '이 조합은 풍미가 완벽하게 어울립니다. 자세한 설명을 보려면 상세 정보를 클릭하세요.'}
                                </Typography>
                                
                                {result.features && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                    {result.features.map((feature, i) => (
                                      <Chip 
                                        key={i} 
                                        label={feature} 
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                          color: 'text.secondary',
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                                
                                <Rating 
                                  value={(result.score || 0.5) * 5} 
                                  precision={0.5} 
                                  readOnly
                                  sx={{ mt: 1 }}
                                />
                              </CardContent>
                              
                              <Divider sx={{ opacity: 0.2 }} />
                              
                              <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                <Button
                                  component={RouterLink}
                                  to={`/${itemType}s/${itemId}`}
                                  size="small"
                                  sx={{ 
                                    color: theme.palette.primary.main
                                  }}
                                >
                                  상세 정보
                                </Button>
                                
                                <Tooltip title="즐겨찾기에 추가">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      color: theme.palette.primary.main,
                                      '&:hover': {
                                        color: theme.palette.primary.light,
                                      }
                                    }}
                                  >
                                    <FavoriteBorderIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </CardActions>
                            </Card>
                          </Grow>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={5}>
                    <Typography variant="h6" color="text.secondary">
                      검색 결과가 없습니다. 다른 조건으로 검색해 보세요.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          </Box>
        )}
      </Container>

      {/* Tips Section */}
      {activeView === 'search' && (
        <Box 
          sx={{ 
            py: 8,
            backgroundColor: alpha(theme.palette.secondary.main, 0.03),
            borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h3" 
                  component="h2" 
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  페어링 노하우
                </Typography>
                
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                  완벽한 페어링을 찾는 데 도움이 되는 팁을 알려드립니다.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      p: 3, 
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        mr: 2, 
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <InfoOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        상호보완적인 풍미
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        서로 보완하는 풍미 요소를 가진 음식과 음료를 페어링하세요. 
                        예를 들어, 탄닌이 강한 레드 와인은 지방이 풍부한 육류와 잘 어울립니다.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      p: 3, 
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        mr: 2, 
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <InfoOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        지역 기반 페어링
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        같은 지역의 음식과 음료는 종종 완벽한 조화를 이룹니다. 
                        이탈리아 와인은 이탈리아 요리와, 일본 사케는 일본 음식과 잘 어울립니다.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      p: 3, 
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        mr: 2, 
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <InfoOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        대비되는 특성
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        때로는 대비되는 특성이 흥미로운 페어링을 만들어냅니다. 
                        달콤한 디저트와 쌉싸름한 주류의 조합이 좋은 예입니다.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      width: '100%',
                      height: '100%',
                      border: `2px solid ${theme.palette.secondary.main}`,
                      borderRadius: 2,
                      zIndex: 0,
                    }
                  }}
                >
                  <Box 
                    component="img"
                    src="/images/pairing-tips.jpg" // 와인/음식 페어링 이미지
                    alt="페어링 노하우"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      {/* Explanation Modal */}
      {pairingExplanation && (
        <Box>
          {/* 페어링 설명 모달 내용 */}
        </Box>
      )}

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            더 많은 페어링을 찾아보세요
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph 
            sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}
          >
            다양한 주류와 재료의 조합을 탐색하고 나만의 페어링을 발견하세요.
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center',
            }}
          >
            <Button
              component={RouterLink}
              to="/liquors"
              variant="outlined"
              color="primary"
              sx={{ 
                px: 4,
                py: 1.5,
                fontWeight: 500,
              }}
              endIcon={<ArrowForwardIcon />}
            >
              주류 둘러보기
            </Button>
            
            <Button
              component={RouterLink}
              to="/ingredients"
              variant="outlined"
              color="secondary"
              sx={{ 
                px: 4,
                py: 1.5,
                fontWeight: 500,
              }}
              endIcon={<ArrowForwardIcon />}
            >
              재료 둘러보기
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default PairingPage;