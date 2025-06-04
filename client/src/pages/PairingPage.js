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

// 영어 재료명을 한글로 번역하는 함수
const translateIngredientName = (englishName) => {
  // null, undefined, 빈 문자열 체크
  if (!englishName || typeof englishName !== 'string') {
    return '알 수 없음';
  }

  const translations = {
    'white_pepper': '화이트 페퍼',
    'pork_shoulder': '돼지 어깨살',
    'mussel': '홍합',
    'golden_brown_sugar': '황설탕',
    'spanish_onion': '스페인 양파',
    'dark_soy_sauce': '진간장',
    'lard': '라드',
    'pork_tenderloin': '돼지 안심',
    'lemon': '레몬',
    'salt_&_freshly_ground_black_pepper': '소금과 후추',
    'rotisserie_cooked_chicken': '로티세리 치킨',
    'grain_cereal': '곡물 시리얼',
    'verjus': '베르쥬',
    'coconut_meat': '코코넛',
    'unsalted_chicken_stock': '무염 치킨 스톡',
    'lemon_balm_leaf': '레몬밤',
    'lemon_peel_strip': '레몬 껍질',
    'granulated_yeast': '효모',
    'turkey_breast_half': '칠면조 가슴살',
    'stone_ground_whole_wheat_flour': '통밀가루',
    'wine': '와인',
    'scotch': '스카치 위스키',
    'bourbon': '버번 위스키',
    'rye_whiskey': '라이 위스키',
    'irish_whiskey': '아이리시 위스키',
    'scotch_whisky': '스카치 위스키',
    'bourbon_whiskey': '버번 위스키',
    'jack_daniels_whiskey': '잭 다니엘 위스키'
  };

  // 번역이 있으면 반환, 없으면 영어명을 보기 좋게 변환
  return translations[englishName] || englishName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

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
      // 페어링 분석
      if (!koreanLiquor || !koreanIngredient) {
        setError('주류와 재료를 모두 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.predictPairing(koreanLiquor, koreanIngredient);
        console.log('Pairing prediction response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '페어링 분석 중 오류가 발생했습니다.');
        setSearching(false);
      }
    } else {
      // 재료 추천
      if (!koreanLiquor) {
        setError('주류를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getRecommendations(koreanLiquor, 10);
        console.log('Recommendations response:', response.data);
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
    if (!score || isNaN(score)) return 0;
    // score가 0-10 범위라면 10으로 나누고, 0-1 범위라면 100을 곱함
    let normalizedScore = score;
    if (score > 10) {
      normalizedScore = (score / 10) * 10; // 점수가 너무 크면 10점 만점으로 정규화
    } else if (score <= 1) {
      normalizedScore = score * 100; // 0-1을 0-100으로
    } else if (score <= 10) {
      normalizedScore = (score / 10) * 100; // 0-10을 0-100으로
    }
    return Math.round(Math.min(normalizedScore, 100));
  };

  // 별점을 계산하는 함수 (5점 만점)
  const getStarRating = (score) => {
    if (!score || isNaN(score)) return 0;
    let normalizedScore = score;
    if (score > 10) {
      normalizedScore = (score / 10) * 5; // 점수가 크면 5점 만점으로
    } else if (score <= 1) {
      normalizedScore = score * 5; // 0-1을 0-5로
    } else if (score <= 10) {
      normalizedScore = (score / 10) * 5; // 0-10을 0-5로
    }
    return Math.min(normalizedScore, 5);
  };

  // 안전한 재료명 추출 함수
  const getIngredientName = (rec) => {
    const name = rec?.ingredient_name || rec?.ingredient || rec?.name;
    return name || '알 수 없음';
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
          <Fade in={true}>
            <Box mt={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {tabValue === 0 ? '페어링 분석 결과' : '재료 추천 결과'}
                </Typography>
                <Button variant="outlined" onClick={handleClearSearch}>새 검색</Button>
              </Box>

              <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                {tabValue === 0 ? (
                  // 페어링 분석 결과
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                        {pairingResults.korean_input?.liquor || koreanLiquor} + {pairingResults.korean_input?.ingredient || koreanIngredient}
                      </Typography>
                      {pairingResults.english_names && (
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          영어명: {pairingResults.english_names.liquor} + {pairingResults.english_names.ingredient}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Rating value={getStarRating(pairingResults.score)} readOnly sx={{ mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {getScoreOutOf100(pairingResults.score)}점 / 100점
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
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {getScoreOutOf100(pairingResults.score) >= 80 ? '매우 좋음' :
                           getScoreOutOf100(pairingResults.score) >= 60 ? '좋음' :
                           getScoreOutOf100(pairingResults.score) >= 40 ? '보통' : '아쉬움'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  // 재료 추천 결과
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {translateIngredientName(pairingResults.liquor_name) || koreanLiquor} 추천 재료
                    </Typography>
                    
                    {/* 전체 설명 */}
                    {pairingResults.overall_explanation && (
                      <Paper sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          전체 추천 설명
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pairingResults.overall_explanation}
                        </Typography>
                      </Paper>
                    )}

                    {/* 추천 재료 카드들 */}
                    <Grid container spacing={3}>
                      {pairingResults.recommendations?.map((rec, index) => {
                        const ingredientName = getIngredientName(rec);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ 
                              p: 3, 
                              height: '100%',
                              transition: 'transform 0.2s, elevation 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                elevation: 8
                              }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {translateIngredientName(ingredientName)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                영어명: {ingredientName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating value={getStarRating(rec.score)} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {getScoreOutOf100(rec.score)}점
                                </Typography>
                              </Box>

                              {rec.explanation && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                  {rec.explanation}
                                </Typography>
                              )}
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {(!pairingResults.recommendations || pairingResults.recommendations.length === 0) && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          추천 결과가 없습니다.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default PairingPage;