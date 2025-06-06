import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import koreanPairingService from '../services/koreanPairingService';
import {
  Box, Container, Typography, Button, Grid, Card, TextField, Paper,
  Chip, CircularProgress, Fade, useTheme, useMediaQuery,
  alpha, Rating, Tab, Tabs, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, WineBar as WineBarIcon, Restaurant as RestaurantIcon,
  LocalBar as LocalBarIcon, Liquor as LiquorIcon, Shuffle as ShuffleIcon,
  Star as StarIcon,
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
  if (!englishName || typeof englishName !== 'string') {
    return '알 수 없음';
  }

  const translations = {
    'wine': '와인', 'white_pepper': '화이트 페퍼', 'pork_shoulder': '돼지 어깨살',
    'mussel': '홍합', 'golden_brown_sugar': '황설탕', 'spanish_onion': '스페인 양파',
    'dark_soy_sauce': '진간장', 'lard': '라드', 'pork_tenderloin': '돼지 안심',
    'lemon': '레몬', 'salt_&_freshly_ground_black_pepper': '소금과 후추',
    'rotisserie_cooked_chicken': '로티세리 치킨', 'grain_cereal': '곡물 시리얼',
    'verjus': '베르쥬', 'coconut_meat': '코코넛', 'unsalted_chicken_stock': '무염 치킨 스톡',
    'lemon_balm_leaf': '레몬밤', 'lemon_peel_strip': '레몬 껍질', 'granulated_yeast': '효모',
    'turkey_breast_half': '칠면조 가슴살', 'stone_ground_whole_wheat_flour': '통밀가루',
    'scotch': '스카치 위스키', 'bourbon': '버번 위스키', 'rye_whiskey': '라이 위스키',
    'irish_whiskey': '아이리시 위스키', 'scotch_whisky': '스카치 위스키',
    'bourbon_whiskey': '버번 위스키', 'jack_daniels_whiskey': '잭 다니엘 위스키',
    'cheese': '치즈', 'chicken': '닭고기', 'beef': '소고기', 'chocolate': '초콜릿',
    'coffee': '커피', 'apple': '사과', 'banana': '바나나', 'tomato': '토마토',
    'onion': '양파', 'garlic': '마늘', 'basil': '바질', 'olive_oil': '올리브 오일',
    'salt': '소금', 'pepper': '후추', 'butter': '버터', 'cream': '크림',
    'milk': '우유', 'egg': '계란', 'bread': '빵', 'rice': '쌀'
  };

  return translations[englishName] || englishName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// 술 이름을 한글로 번역하는 함수
const translateLiquorName = (englishName) => {
  if (!englishName || typeof englishName !== 'string') {
    return '알 수 없음';
  }

  const translations = {
    'wine': '와인', 'red_wine': '레드 와인', 'white_wine': '화이트 와인',
    'whiskey': '위스키', 'whisky': '위스키', 'scotch': '스카치 위스키',
    'bourbon': '버번 위스키', 'rye_whiskey': '라이 위스키',
    'irish_whiskey': '아이리시 위스키', 'scotch_whisky': '스카치 위스키',
    'bourbon_whiskey': '버번 위스키', 'jack_daniels_whiskey': '잭 다니엘 위스키',
    'vodka': '보드카', 'gin': '진', 'rum': '럼', 'tequila': '데킬라',
    'beer': '맥주', 'ale': '에일', 'lager': '라거', 'stout': '스타우트',
    'sake': '사케', 'soju': '소주', 'makgeolli': '막걸리',
    'cognac': '코냑', 'brandy': '브랜디', 'armagnac': '아르마냑',
    'vermouth': '베르무트', 'champagne': '샴페인', 'prosecco': '프로세코',
    'port': '포트 와인', 'sherry': '셰리', 'madeira': '마데이라'
  };

  return translations[englishName] || englishName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

function PairingPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const modeParam = queryParams.get('mode');

  // URL 파라미터에 따라 초기 탭 설정
  const getInitialTab = () => {
    if (modeParam === 'ingredient-recommendation') return 1;
    if (modeParam === 'liquor-recommendation') return 2;
    return 0;
  };

  const [tabValue, setTabValue] = useState(getInitialTab());
  const [koreanLiquor, setKoreanLiquor] = useState('');
  const [koreanIngredient, setKoreanIngredient] = useState('');
  const [pairingResults, setPairingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search');

  useEffect(() => {
    // URL 파라미터가 변경될 때 탭 업데이트
    setTabValue(getInitialTab());
  }, [location.search]);

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
    } else if (tabValue === 1) {
      // 재료 추천
      if (!koreanLiquor) {
        setError('주류를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getRecommendations(koreanLiquor, 3);
        console.log('Ingredient recommendations response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '재료 추천 중 오류가 발생했습니다.');
        setSearching(false);
      }
    } else if (tabValue === 2) {
      // 술 추천
      if (!koreanIngredient) {
        setError('재료를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getLiquorRecommendations(koreanIngredient, 3);
        console.log('Liquor recommendations response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '술 추천 중 오류가 발생했습니다.');
        setSearching(false);
      }
    }
  };

  const handleClearSearch = () => {
    setKoreanLiquor('');
    setKoreanIngredient('');
    setPairingResults(null);
    setError(null);
    setActiveView('search');
    navigate('/pairing');
  };

  const getScoreOutOf100 = (score) => {
    if (!score || isNaN(score)) return 0;
    let normalizedScore = score;
    if (score > 10) {
      normalizedScore = (score / 10) * 10;
    } else if (score <= 1) {
      normalizedScore = score * 100;
    } else if (score <= 10) {
      normalizedScore = (score / 10) * 100;
    }
    return Math.round(Math.min(normalizedScore, 100));
  };

  const getStarRating = (score) => {
    if (!score || isNaN(score)) return 0;
    let normalizedScore = score;
    if (score > 10) {
      normalizedScore = (score / 10) * 5;
    } else if (score <= 1) {
      normalizedScore = score * 5;
    } else if (score <= 10) {
      normalizedScore = (score / 10) * 5;
    }
    return Math.min(normalizedScore, 5);
  };

  const getIngredientName = (rec) => {
    const name = rec?.ingredient_name || rec?.ingredient || rec?.name;
    return name || '알 수 없음';
  };

  const getLiquorName = (rec) => {
    const name = rec?.liquor_name || rec?.liquor || rec?.name;
    return name || '알 수 없음';
  };

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
              좋아하는 주류나 음식을 입력하면 AI가 최적의 페어링을 추천해 드립니다.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Search */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab 
              label="페어링 분석" 
              icon={<WineBarIcon />}
              iconPosition="start"
              sx={{ minHeight: 64, fontSize: '1.1rem' }}
            />
            <Tab 
              label="재료 추천" 
              icon={<RestaurantIcon />}
              iconPosition="start"
              sx={{ minHeight: 64, fontSize: '1.1rem' }}
            />
            <Tab 
              label="술 추천" 
              icon={<LocalBarIcon />}
              iconPosition="start"
              sx={{ minHeight: 64, fontSize: '1.1rem' }}
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                주류와 재료의 페어링 점수를 분석합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                두 가지를 모두 입력하시면 AI가 얼마나 잘 어울리는지 분석해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="주류"
                  placeholder="예: 위스키, 와인, 맥주, 소주"
                  value={koreanLiquor}
                  onChange={(e) => setKoreanLiquor(e.target.value)}
                  disabled={searching}
                  InputProps={{ 
                    startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="재료"
                  placeholder="예: 치즈, 초콜릿, 고기, 해산물"
                  value={koreanIngredient}
                  onChange={(e) => setKoreanIngredient(e.target.value)}
                  disabled={searching}
                  InputProps={{ 
                    startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ height: 64 }}
                  onClick={handleKoreanSearch}
                  disabled={searching || !koreanLiquor || !koreanIngredient}
                  startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  {searching ? '분석 중...' : '분석하기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                주류에 어울리는 재료를 추천합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                좋아하는 주류를 입력하시면 AI가 가장 잘 어울리는 재료 3가지를 추천해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="주류"
                  placeholder="예: 위스키, 와인, 맥주, 소주, 진, 럼"
                  value={koreanLiquor}
                  onChange={(e) => setKoreanLiquor(e.target.value)}
                  disabled={searching}
                  InputProps={{ 
                    startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ height: 64 }}
                  onClick={handleKoreanSearch}
                  disabled={searching || !koreanLiquor}
                  startIcon={searching ? <CircularProgress size={20} /> : <StarIcon />}
                >
                  {searching ? '추천 중...' : '추천받기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                재료에 어울리는 술을 추천합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                좋아하는 음식이나 재료를 입력하시면 AI가 가장 잘 어울리는 술 3가지를 추천해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="재료"
                  placeholder="예: 치즈, 초콜릿, 스테이크, 해산물, 디저트"
                  value={koreanIngredient}
                  onChange={(e) => setKoreanIngredient(e.target.value)}
                  disabled={searching}
                  InputProps={{ 
                    startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ height: 64 }}
                  onClick={handleKoreanSearch}
                  disabled={searching || !koreanIngredient}
                  startIcon={searching ? <CircularProgress size={20} /> : <LocalBarIcon />}
                >
                  {searching ? '추천 중...' : '추천받기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Results */}
        {activeView === 'results' && pairingResults && (
          <Fade in={true}>
            <Box mt={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {tabValue === 0 ? '페어링 분석 결과' : 
                   tabValue === 1 ? '재료 추천 결과' : '술 추천 결과'}
                </Typography>
                <Button variant="outlined" onClick={handleClearSearch} size="large">
                  새 검색
                </Button>
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
                ) : tabValue === 1 ? (
                  // 재료 추천 결과
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {translateIngredientName(pairingResults.liquor_name) || koreanLiquor} 추천 재료 TOP 3
                    </Typography>
                    
                    {pairingResults.overall_explanation && (
                      <Paper sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          💡 전체 추천 설명
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pairingResults.overall_explanation}
                        </Typography>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      {pairingResults.recommendations?.map((rec, index) => {
                        const ingredientName = getIngredientName(rec);
                        return (
                          <Grid item xs={12} md={4} key={index}>
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
                                <Typography variant="h5" sx={{ 
                                  fontWeight: 700, 
                                  color: 'primary.main',
                                  mr: 1,
                                  minWidth: 32
                                }}>
                                  #{index + 1}
                                </Typography>
                                <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {translateIngredientName(ingredientName)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                영어명: {ingredientName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Rating value={getStarRating(rec.score)} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                ) : (
                  // 술 추천 결과
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {translateIngredientName(pairingResults.ingredient_name) || koreanIngredient} 추천 술 TOP 3
                    </Typography>
                    
                    {pairingResults.overall_explanation && (
                      <Paper sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          💡 전체 추천 설명
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pairingResults.overall_explanation}
                        </Typography>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      {pairingResults.recommendations?.map((rec, index) => {
                        const liquorName = getLiquorName(rec);
                        return (
                          <Grid item xs={12} md={4} key={index}>
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
                                <Typography variant="h5" sx={{ 
                                  fontWeight: 700, 
                                  color: 'primary.main',
                                  mr: 1,
                                  minWidth: 32
                                }}>
                                  #{index + 1}
                                </Typography>
                                <LocalBarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {translateLiquorName(liquorName)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                영어명: {liquorName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Rating value={getStarRating(rec.score)} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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