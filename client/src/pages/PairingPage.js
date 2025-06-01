import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import koreanPairingService from '../services/koreanPairingService';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  Autocomplete,
  useTheme,
  useMediaQuery,
  alpha,
  Rating,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WineBarIcon from '@mui/icons-material/WineBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import LiquorIcon from '@mui/icons-material/Liquor';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import TranslateIcon from '@mui/icons-material/Translate';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PairingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  // URL 쿼리 파라미터 파싱
  const queryParams = new URLSearchParams(location.search);
  const liquorIdParam = queryParams.get('liquorId');
  const ingredientIdParam = queryParams.get('ingredientId');
  const koreanParam = queryParams.get('korean');

  // 상태 정의
  const [inputMode, setInputMode] = useState(koreanParam === 'true' ? 'korean' : 'select');
  const [tabValue, setTabValue] = useState(0);
  
  // 기존 선택 방식 상태
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedLiquor, setSelectedLiquor] = useState(liquorIdParam ? Number(liquorIdParam) : null);
  const [selectedIngredient, setSelectedIngredient] = useState(ingredientIdParam ? Number(ingredientIdParam) : null);
  
  // 한글 입력 방식 상태
  const [koreanLiquor, setKoreanLiquor] = useState('');
  const [koreanIngredient, setKoreanIngredient] = useState('');
  
  // 공통 상태
  const [pairingResults, setPairingResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search');

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const liquorsResponse = await axios.get('/api/liquors');
        const ingredientsResponse = await axios.get('/api/ingredients');
        
        const liquorsData = Array.isArray(liquorsResponse.data) 
          ? liquorsResponse.data 
          : (liquorsResponse.data.data || []);
          
        const ingredientsData = Array.isArray(ingredientsResponse.data) 
          ? ingredientsResponse.data 
          : (ingredientsResponse.data.data || []);
        
        setLiquors(liquorsData);
        setIngredients(ingredientsData);
        setLoading(false);
        
        if (liquorIdParam || ingredientIdParam) {
          handleSelectSearch();
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // 입력 모드 변경
  const handleInputModeChange = (event) => {
    setInputMode(event.target.checked ? 'korean' : 'select');
    setError(null);
    setPairingResults(null);
    setActiveView('search');
  };

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
  };

  // 기존 선택 방식 검색
  const handleSelectSearch = async () => {
    if (!selectedLiquor && !selectedIngredient) {
      setError('주류 또는 재료를 선택해주세요.');
      return;
    }
    
    try {
      setSearching(true);
      setError(null);
      setPairingResults(null);
      
      let response;
      if (selectedLiquor) {
        response = await axios.get(`/api/pairing/recommendations/${selectedLiquor}`);
      } else if (selectedIngredient) {
        response = await axios.get(`/api/pairing/recommendations/ingredient/${selectedIngredient}`);
      }
      
      const data = response.data;
      console.log('Pairing results:', data);
      
      setPairingResults(data);
      setActiveView('results');
      setSearching(false);
      
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

  // 한글 입력 검색
  const handleKoreanSearch = async () => {
    if (tabValue === 0) {
      if (!koreanLiquor || !koreanIngredient) {
        setError('주류와 재료를 모두 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        setPairingResults(null);
        
        const response = await koreanPairingService.predictPairing(koreanLiquor, koreanIngredient);
        console.log('Korean pairing result:', response);
        
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
        
        const params = new URLSearchParams();
        params.set('korean', 'true');
        params.set('liquor', koreanLiquor);
        params.set('ingredient', koreanIngredient);
        navigate({ search: params.toString() });
        
      } catch (err) {
        setError(err.message || '페어링 분석 중 오류가 발생했습니다.');
        setSearching(false);
        console.error('Error in Korean pairing:', err);
      }
    } else {
      if (!koreanLiquor) {
        setError('주류를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        setPairingResults(null);
        
        const response = await koreanPairingService.getRecommendations(koreanLiquor, 10);
        console.log('Korean recommendations result:', response);
        
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
        
      } catch (err) {
        setError(err.message || '재료 추천 중 오류가 발생했습니다.');
        setSearching(false);
        console.error('Error in Korean recommendations:', err);
      }
    }
  };

  // 검색 클리어
  const handleClearSearch = () => {
    setSelectedLiquor(null);
    setSelectedIngredient(null);
    setKoreanLiquor('');
    setKoreanIngredient('');
    setPairingResults(null);
    setError(null);
    setActiveView('search');
    navigate('/pairing');
  };

  // 주류 타입별 색상/아이콘 매핑
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
      default:
        return theme.palette.secondary.main;
    }
  };

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
            backgroundImage: 'url(/images/pairing-header-bg.jpg)',
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
            {/* 입력 모드 전환 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={inputMode === 'korean'}
                    onChange={handleInputModeChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TranslateIcon />
                    <Typography>한글로 입력하기</Typography>
                  </Box>
                }
              />
            </Box>

            {inputMode === 'korean' ? (
              // 한글 입력 모드
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="pairing tabs">
                    <Tab label="페어링 분석" />
                    <Tab label="재료 추천" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="주류 (한글)"
                        placeholder="예: 위스키, 와인, 맥주"
                        value={koreanLiquor}
                        onChange={(e) => setKoreanLiquor(e.target.value)}
                        disabled={searching}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ color: theme.palette.primary.main, mr: 1 }}>
                              <WineBarIcon />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="재료 (한글)"
                        placeholder="예: 치즈, 초콜릿, 고기"
                        value={koreanIngredient}
                        onChange={(e) => setKoreanIngredient(e.target.value)}
                        disabled={searching}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ color: theme.palette.primary.main, mr: 1 }}>
                              <RestaurantIcon />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleKoreanSearch}
                        disabled={searching || !koreanLiquor || !koreanIngredient}
                        fullWidth
                        sx={{ height: 56 }}
                        startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                      >
                        {searching ? '분석 중...' : '분석'}
                      </Button>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="주류 (한글)"
                        placeholder="예: 위스키, 와인, 맥주"
                        value={koreanLiquor}
                        onChange={(e) => setKoreanLiquor(e.target.value)}
                        disabled={searching}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ color: theme.palette.primary.main, mr: 1 }}>
                              <WineBarIcon />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleKoreanSearch}
                        disabled={searching || !koreanLiquor}
                        fullWidth
                        sx={{ height: 56 }}
                        startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                      >
                        {searching ? '추천 중...' : '추천받기'}
                      </Button>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Box>
            ) : (
              // 기존 선택 모드는 다음 업데이트에서 추가
              <Box textAlign="center" py={4}>
                <Typography>기존 선택 모드는 다음 업데이트에 추가됩니다.</Typography>
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default PairingPage;