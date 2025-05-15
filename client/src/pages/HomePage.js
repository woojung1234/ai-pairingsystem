import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
  Paper,
  Chip,
  alpha
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WineBarIcon from '@mui/icons-material/WineBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScienceIcon from '@mui/icons-material/Science';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import LiquorIcon from '@mui/icons-material/Liquor';
import BrunchDiningIcon from '@mui/icons-material/BrunchDining';

function HomePage() {
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 주류 데이터 가져오기 (기존 API 활용)
        const liquorsResponse = await axios.get('/api/liquors');
        console.log('Liquors response:', liquorsResponse.data);
        
        // 재료 데이터 가져오기 (기존 API 활용)
        const ingredientsResponse = await axios.get('/api/ingredients');
        console.log('Ingredients response:', ingredientsResponse.data);
        
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
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // 주류 타입별 색상 매핑
  const getLiquorColor = (type) => {
    switch(type && type.toLowerCase()) {
      case '와인':
      case 'wine':
        return theme.palette.primary.main;
      case '위스키':
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
        return <WineBarIcon sx={{ fontSize: 40 }} />;
      case '위스키':
      case 'whiskey':
      case 'whisky':
        return <LiquorIcon sx={{ fontSize: 40 }} />;
      case '맥주':
      case 'beer':
        return <LocalBarIcon sx={{ fontSize: 40 }} />;
      default:
        return <WineBarIcon sx={{ fontSize: 40 }} />;
    }
  };

  const features = [
    {
      icon: <WineBarIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      title: "종합적인 주류 데이터베이스",
      description: "세계 각국의 다양한 주류 컬렉션을 탐험해보세요. 상세한 풍미 프로필과 원산지 정보가 포함되어 있습니다."
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      title: "재료 매칭",
      description: "상호 보완적인 풍미 화합물과 전문가 추천을 기반으로 좋아하는 술과 완벽한 조합을 이루는 재료를 발견하세요."
    },
    {
      icon: <ScienceIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      title: "설명 가능한 AI",
      description: "특정 조합이 잘 어울리는 이유를 이해해보세요. 우리의 투명한 AI 시스템이 각 추천 뒤에 숨은 과학을 설명합니다."
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '85vh', md: '95vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/hero-bg.jpg)', // 고급스러운 와인/음식 이미지
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
            zIndex: -1,
          },
          "&::after": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom, rgba(18,18,18,0.7) 0%, rgba(18,18,18,0.4) 50%, rgba(18,18,18,0.8) 100%)',
            zIndex: -1,
          }
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            mt: { xs: 10, md: 0 } 
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={7}>
              <Box
                sx={{
                  animation: 'fadeInUp 1s ease',
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: theme.palette.secondary.main,
                    fontWeight: 500,
                    letterSpacing: '0.15em',
                    mb: 2,
                    display: 'block',
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}
                >
                  AI 기반 페어링 시스템
                </Typography>
                
                <Typography 
                  variant="h1" 
                  color="white"
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  술과 음식의 <br />
                  <Box 
                    component="span" 
                    sx={{ 
                      color: theme.palette.secondary.main,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        left: 0,
                        width: '40%',
                        height: '2px',
                        backgroundColor: theme.palette.secondary.main,
                      }
                    }}
                  >
                    과학적인 조화
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    mb: 5,
                    maxWidth: 600,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  AI 기반 페어링 시스템으로 당신의 미각을 만족시킬 최상의 조합을 찾아드립니다.
                  화학 성분 분석과 전문가의 지식을 결합한 과학적 접근으로 완벽한 경험을 제공합니다.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    to="/pairing"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontWeight: 500,
                      fontSize: '1rem',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 25px rgba(212, 175, 55, 0.4)',
                      }
                    }}
                  >
                    페어링 찾기
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/about"
                    variant="outlined"
                    color="secondary"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontWeight: 500,
                      fontSize: '1rem',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    더 알아보기
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
        
        {/* Scroll Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            opacity: 0.7,
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': {
                transform: 'translateY(0) translateX(-50%)'
              },
              '40%': {
                transform: 'translateY(-20px) translateX(-50%)'
              },
              '60%': {
                transform: 'translateY(-10px) translateX(-50%)'
              }
            }
          }}
        >
          <Typography variant="overline" sx={{ mb: 1, letterSpacing: 2 }}>
            스크롤
          </Typography>
          <Box
            sx={{
              width: 1,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                animation: 'scroll 2s infinite',
              },
              '@keyframes scroll': {
                '0%': {
                  height: '0%'
                },
                '50%': {
                  height: '100%'
                },
                '100%': {
                  height: '0%'
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* Features Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/texture-bg.png)', // 미묘한 텍스처 배경
            backgroundSize: 'cover',
            opacity: 0.03,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500,
                letterSpacing: '0.15em',
                mb: 2,
                display: 'block'
              }}
            >
              주요 기능
            </Typography>
            
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 2,
                  backgroundColor: theme.palette.secondary.main,
                }
              }}
            >
              찰떡궁합이 제공하는 가치
            </Typography>
            
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: '1.1rem',
              }}
            >
              과학과 예술이 만나 완벽한 페어링을 찾아드립니다. 
              데이터 기반의 추천과 풍미 분석으로 새로운 경험을 발견하세요.
            </Typography>
          </Box>
          
          <Grid container spacing={5} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Box 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 4,
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: `linear-gradient(to right, transparent, ${theme.palette.secondary.main}20, transparent)`,
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        mb: 3,
                        p: 2,
                        borderRadius: '50%',
                        background: alpha(theme.palette.primary.main, 0.05),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h4" 
                      component="h3" 
                      gutterBottom
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.8 }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Liquors Carousel Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          position: 'relative',
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/wine-bg.jpg)', // 와인 셀러 배경 이미지
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.15)',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  mb: 1,
                  display: 'block'
                }}
              >
                셀렉션
              </Typography>
              <Typography 
                variant="h3" 
                component="h2"
                color="white"
              >
                인기있는 주류
              </Typography>
            </Box>
            
            <Button 
              component={RouterLink} 
              to="/liquors" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                color: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.light,
                  backgroundColor: 'rgba(212, 175, 55, 0.05)',
                }
              }}
              variant="outlined"
            >
              모두 보기
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {Array.isArray(liquors) && liquors.length > 0 
              ? liquors.slice(0, isMobile ? 2 : 4).map((liquor) => (
                <Grid item xs={12} sm={6} md={3} key={liquor.id}>
                  <Fade in={true} style={{ transitionDelay: '200ms' }}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(20, 20, 20, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: 200, 
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {liquor.imageUrl ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={liquor.imageUrl}
                            alt={liquor.name}
                            sx={{ 
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha(getLiquorColor(liquor.type), 0.15),
                            }}
                          >
                            {getLiquorIcon(liquor.type)}
                          </Box>
                        )}
                        
                        {liquor.type && (
                          <Chip 
                            label={liquor.type} 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 12, 
                              left: 12,
                              backgroundColor: alpha(getLiquorColor(liquor.type), 0.8),
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          gutterBottom
                          color="white"
                          sx={{ fontWeight: 600 }}
                        >
                          {liquor.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
                          {liquor.country && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: '0.85rem',
                              }}
                            >
                              원산지: {liquor.country}
                            </Typography>
                          )}
                          {liquor.alcoholContent && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: '0.85rem',
                              }}
                            >
                              알코올 도수: {liquor.alcoholContent}%
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                      <CardActions 
                        sx={{ 
                          p: 2, 
                          justifyContent: isSmall ? 'center' : 'space-between',
                          flexDirection: isSmall ? 'column' : 'row',
                          gap: isSmall ? 1 : 0,
                        }}
                      >
                        <Button 
                          component={RouterLink} 
                          to={`/liquors/${liquor.id}`}
                          size="small" 
                          sx={{ 
                            color: theme.palette.secondary.main,
                            fontWeight: 500,
                          }}
                        >
                          자세히 보기
                        </Button>
                        <Button 
                          component={RouterLink} 
                          to={`/pairing?liquorId=${liquor.id}`}
                          variant="contained"
                          size="small" 
                          color="primary"
                          sx={{ 
                            fontWeight: 500,
                            boxShadow: 'none',
                            px: 2,
                          }}
                        >
                          페어링 찾기
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              ))
              : (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary">
                    주류 데이터를 불러올 수 없습니다.
                  </Typography>
                </Grid>
              )
            }
          </Grid>
        </Container>
      </Box>
      
      {/* Ingredients Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  mb: 1,
                  display: 'block'
                }}
              >
                페어링
              </Typography>
              <Typography 
                variant="h3" 
                component="h2"
              >
                추천 페어링 재료
              </Typography>
            </Box>
            
            <Button 
              component={RouterLink} 
              to="/ingredients" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.light,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
              variant="outlined"
            >
              모두 보기
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {Array.isArray(ingredients) && ingredients.length > 0 
              ? ingredients.slice(0, isMobile ? 2 : 4).map((ingredient) => (
                <Grid item xs={12} sm={6} md={3} key={ingredient.id}>
                  <Fade in={true} style={{ transitionDelay: '200ms' }}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(5px)',
                      }}
                    >
                      <Box sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                        {ingredient.imageUrl ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={ingredient.imageUrl}
                            alt={ingredient.name}
                            sx={{ 
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          >
                            <RestaurantIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                          </Box>
                        )}
                        
                        {ingredient.category && (
                          <Chip 
                            label={ingredient.category} 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 12, 
                              left: 12,
                              backgroundColor: alpha(theme.palette.primary.main, 0.8),
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {ingredient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {ingredient.description || '이 재료는 다양한 주류와 페어링되어 특별한 맛을 선사합니다.'}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <CardActions 
                        sx={{ 
                          p: 2, 
                          justifyContent: isSmall ? 'center' : 'space-between',
                          flexDirection: isSmall ? 'column' : 'row',
                          gap: isSmall ? 1 : 0,
                        }}
                      >
                        <Button 
                          component={RouterLink} 
                          to={`/ingredients/${ingredient.id}`}
                          size="small" 
                          sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                          }}
                        >
                          자세히 보기
                        </Button>
                        <Button 
                          component={RouterLink} 
                          to={`/pairing?ingredientId=${ingredient.id}`}
                          variant="contained"
                          size="small" 
                          color="primary"
                          sx={{ 
                            fontWeight: 500,
                            boxShadow: 'none',
                            px: 2,
                          }}
                        >
                          페어링 찾기
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              ))
              : (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary">
                    재료 데이터를 불러올 수 없습니다.
                  </Typography>
                </Grid>
              )
            }
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          backgroundColor: alpha(theme.palette.secondary.main, 0.03),
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/pattern-bg.png)', // 미묘한 패턴 배경
            backgroundSize: 'cover',
            opacity: 0.05,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500,
                letterSpacing: '0.15em',
                mb: 2,
                display: 'block'
              }}
            >
              이용 방법
            </Typography>
            
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 2,
                  backgroundColor: theme.palette.secondary.main,
                }
              }}
            >
              사용 방법
            </Typography>
            
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: '1.1rem',
              }}
            >
              세 가지 간단한 단계로 완벽한 페어링을 찾아보세요.
            </Typography>
          </Box>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                }}
              >
                <Box mb={4}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main,
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        mr: 2,
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      1
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      주류 또는 재료 선택
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      ml: 9, 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                    }}
                  >
                    좋아하는 술이나 함께 페어링하고 싶은 재료를 선택하여 시작하세요.
                    음료로 시작하거나 음식으로 시작하거나 둘 다 가능합니다.
                  </Typography>
                </Box>
                
                <Box mb={4}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main,
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        mr: 2,
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      2
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      AI 기반 추천 받기
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      ml: 9, 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                    }}
                  >
                    우리의 고급 AI 모델은 수천 가지의 잠재적 조합을 분석하여 풍미 화합물, 전통적인 페어링, 사용자 취향을 고려하여 최적의 조합을 추천합니다.
                  </Typography>
                </Box>
                
                <Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main,
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        mr: 2,
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      3
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      페어링 배후의 과학 이해하기
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      ml: 9, 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                    }}
                  >
                    각 추천에는 이러한 풍미가 왜 잘 어울리는지에 대한 상세한 설명이 제공되어, 새로운 조합을 발견하면서 풍미 과학에 대해 배울 수 있습니다.
                  </Typography>
                </Box>
              </Paper>
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
                  src="/images/how-it-works.jpg" // 고급스러운 이미지로 변경 필요
                  alt="How it works illustration"
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

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/cta-bg.jpg)', // 고급스러운 와인/음식 이미지
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.2)',
            zIndex: 0,
          }
        }}
      >
        <Container 
          maxWidth="md" 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            textAlign: 'center' 
          }}
        >
          <Typography 
            variant="h2" 
            color="white"
            sx={{ 
              mb: 3,
              fontWeight: 600,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            놀라운 페어링을 발견할 준비가 되셨나요?
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              mb: 5,
              fontWeight: 400,
              lineHeight: 1.7,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            주류와 재료 데이터베이스를 탐색하여 완벽한 조합을 찾아보세요.
            처음부터 끝까지 AI가 안내해 드립니다.
          </Typography>
          
          <Button
            component={RouterLink}
            to="/pairing"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ 
              py: 1.5,
              px: 5,
              fontWeight: 500,
              fontSize: '1.1rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(212, 175, 55, 0.5)',
              }
            }}
          >
            페어링 도구 지금 사용해보기
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;