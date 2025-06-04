import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import koreanPairingService from '../services/koreanPairingService';
import {
  Box, Container, Typography, Button, Grid, Card, TextField, Paper,
  Chip, CircularProgress, Fade, Autocomplete, useTheme, useMediaQuery,
  alpha, Rating, Switch, FormControlLabel, Tab, Tabs, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, WineBar as WineBarIcon, Restaurant as RestaurantIcon,
  LocalBar as LocalBarIcon, Liquor as LiquorIcon, Shuffle as ShuffleIcon,
  Star as StarIcon, Translate as TranslateIcon,
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function PairingPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const liquorIdParam = queryParams.get('liquorId');
  const ingredientIdParam = queryParams.get('ingredientId');
  const koreanParam = queryParams.get('korean');

  const [inputMode, setInputMode] = useState(koreanParam === 'true' ? 'korean' : 'select');
  const [tabValue, setTabValue] = useState(0);
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedLiquor, setSelectedLiquor] = useState(liquorIdParam ? Number(liquorIdParam) : null);
  const [selectedIngredient, setSelectedIngredient] = useState(ingredientIdParam ? Number(ingredientIdParam) : null);
  const [koreanLiquor, setKoreanLiquor] = useState('');
  const [koreanIngredient, setKoreanIngredient] = useState('');
  const [pairingResults, setPairingResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [liquorsResponse, ingredientsResponse] = await Promise.all([
          axios.get('/api/liquors'),
          axios.get('/api/ingredients')
        ]);
        
        setLiquors(Array.isArray(liquorsResponse.data) ? liquorsResponse.data : liquorsResponse.data.data || []);
        setIngredients(Array.isArray(ingredientsResponse.data) ? ingredientsResponse.data : ingredientsResponse.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleKoreanSearch = async () => {
    if (tabValue === 0) {
      if (!koreanLiquor || !koreanIngredient) {
        setError('주류와 재료를 모두 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.predictPairing(koreanLiquor, koreanIngredient);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '페어링 분석 중 오류가 발생했습니다.');
        setSearching(false);
      }
    } else {
      if (!koreanLiquor) {
        setError('주류를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getRecommendations(koreanLiquor, 10);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '재료 추천 중 오류가 발생했습니다.');
        setSearching(false);
      }
    }
  };

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

  // 점수를 0-100점으로 변환하는 함수
  const getScoreOutOf100 = (score) => {
    if (!score) return 0;
    // score가 0-1 범위라면 100을 곱하고, 이미 큰 값이라면 그대로 사용
    const normalizedScore = score <= 1 ? score * 100 : score;
    return Math.round(normalizedScore);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        py: 12, 
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        backgroundImage: 'linear-gradient(135deg, rgba(138,36,39,0.1) 0%, rgba(183,152,90,0.1) 100%)'
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h1" component="h1" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              완벽한 페어링 찾기
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
              좋아하는 주류나 음식을 선택하면 AI가 최적의 페어링을 추천해 드립니다.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Search */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <FormControlLabel
              control={<Switch checked={inputMode === 'korean'} onChange={(e) => setInputMode(e.target.checked ? 'korean' : 'select')} />}
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TranslateIcon /><Typography>한글로 입력하기</Typography></Box>}
            />
          </Box>

          {inputMode === 'korean' ? (
            <Box>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tab label="페어링 분석" />
                <Tab label="재료 추천" />
              </Tabs>

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
                      InputProps={{ startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
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
                      InputProps={{ startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ height: 56 }}
                      onClick={handleKoreanSearch}
                      disabled={searching || !koreanLiquor || !koreanIngredient}
                      startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
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
                      InputProps={{ startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ height: 56 }}
                      onClick={handleKoreanSearch}
                      disabled={searching || !koreanLiquor}
                      startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      {searching ? '추천 중...' : '추천받기'}
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={liquors}
                  getOptionLabel={(option) => option.name || ''}
                  value={liquors.find(l => l.id === selectedLiquor) || null}
                  onChange={(e, v) => setSelectedLiquor(v?.id || null)}
                  renderInput={(params) => <TextField {...params} label="주류 선택" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={ingredients}
                  getOptionLabel={(option) => option.name || ''}
                  value={ingredients.find(i => i.id === selectedIngredient) || null}
                  onChange={(e, v) => setSelectedIngredient(v?.id || null)}
                  renderInput={(params) => <TextField {...params} label="재료 선택" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" fullWidth sx={{ height: 56 }}>검색</Button>
              </Grid>
            </Grid>
          )}

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </Paper>

        {/* Results */}
        {activeView === 'results' && pairingResults && (
          <Box mt={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {inputMode === 'korean' && tabValue === 0 ? '페어링 분석 결과' : 
                 inputMode === 'korean' && tabValue === 1 ? '재료 추천 결과' : '결과'}
              </Typography>
              <Button variant="text" onClick={handleClearSearch}>새 검색</Button>
            </Box>

            <Paper elevation={2} sx={{ p: 4 }}>
              {tabValue === 0 ? (
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {pairingResults.korean_input?.liquor} + {pairingResults.korean_input?.ingredient}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      영어명: {pairingResults.english_names?.liquor} + {pairingResults.english_names?.ingredient}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Rating value={pairingResults.score ? pairingResults.score * 5 : 0} readOnly sx={{ mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {getScoreOutOf100(pairingResults.score)} / 100
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {pairingResults.gpt_explanation || pairingResults.explanation || '이 조합에 대한 설명이 없습니다.'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>페어링 점수</Typography>
                      <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {getScoreOutOf100(pairingResults.score)}점
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {pairingResults.korean_input} 추천 재료
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {pairingResults.recommendations?.map((rec, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {rec.ingredient || rec.name || '알 수 없음'}
                            </Typography>
                          </Box>
                          <Rating value={rec.score ? rec.score * 5 : 0} readOnly size="small" />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {getScoreOutOf100(rec.score)}점
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default PairingPage;