import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { 
  LocalBar as LocalBarIcon,
  Restaurant as RestaurantIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Fastfood as FastfoodIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 슬라이더 참조
  const liquorSliderRef = useRef(null);
  const ingredientSliderRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 주류 데이터 가져오기
        const liquorsResponse = await axios.get('/api/liquors');
        console.log('Liquors response:', liquorsResponse.data);
        
        // 재료 데이터 가져오기
        const ingredientsResponse = await axios.get('/api/ingredients');
        console.log('Ingredients response:', ingredientsResponse.data);
        
        // 응답 데이터 구조 확인 및 변환
        const liquorsData = Array.isArray(liquorsResponse.data) 
          ? liquorsResponse.data 
          : (liquorsResponse.data.data || []);
          
        const ingredientsData = Array.isArray(ingredientsResponse.data) 
          ? ingredientsResponse.data 
          : (ingredientsResponse.data.data || []);
        
        setLiquors(liquorsData.slice(0, 6)); // 6개만
        setIngredients(ingredientsData.slice(0, 6)); // 6개만
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
        
        // API 호출 실패 시 샘플 데이터 사용
        setLiquors([
          { id: 1, name: "레드 와인", type: "와인", imageUrl: "/images/red-wine.jpg" },
          { id: 2, name: "화이트 와인", type: "와인", imageUrl: "/images/white-wine.jpg" },
          { id: 3, name: "위스키", type: "위스키", imageUrl: "/images/whiskey.jpg" },
          { id: 4, name: "진", type: "진", imageUrl: "/images/gin.jpg" },
          { id: 5, name: "보드카", type: "보드카", imageUrl: "/images/vodka.jpg" },
          { id: 6, name: "소주", type: "소주", imageUrl: "/images/soju.jpg" },
        ]);
        
        setIngredients([
          { id: 1, name: "스테이크", category: "육류", imageUrl: "/images/steak.jpg" },
          { id: 2, name: "치즈", category: "유제품", imageUrl: "/images/cheese.jpg" },
          { id: 3, name: "해산물", category: "해산물", imageUrl: "/images/seafood.jpg" },
          { id: 4, name: "디저트", category: "디저트", imageUrl: "/images/dessert.jpg" },
          { id: 5, name: "파스타", category: "면류", imageUrl: "/images/pasta.jpg" },
          { id: 6, name: "샐러드", category: "채소", imageUrl: "/images/salad.jpg" },
        ]);
      }
    };

    fetchData();
  }, []);

  // 페어링 페이지로 이동
  const handlePairingExplore = () => {
    navigate('/pairing');
  };

  // 술 추천 페이지로 이동 (재료 입력)
  const handleLiquorRecommendation = () => {
    navigate('/pairing?mode=liquor-recommendation');
  };

  // 음식 추천 페이지로 이동 (술 입력)
  const handleIngredientRecommendation = () => {
    navigate('/pairing?mode=ingredient-recommendation');
  };

  // 슬라이더 설정
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false, // 기본 화살표 제거
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section - 모던한 제목 스타일 */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 6,
          py: 10,
          px: 4,
          borderRadius: 4,
          background: `
            linear-gradient(135deg, 
              rgba(45, 45, 45, 0.75) 0%, 
              rgba(60, 39, 35, 0.8) 50%, 
              rgba(75, 50, 40, 0.75) 100%
            ),
            url('/images/wine-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '2px solid rgba(139, 69, 19, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box textAlign="center" position="relative" zIndex={1}>
          {/* 모던한 제목 디자인 */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={3} mb={3}>
            <LocalBarIcon sx={{ 
              fontSize: { xs: 32, md: 40 }, 
              color: '#FFD700',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} />
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 30%, #FF8C00 60%, #FFD700 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
                textShadow: 'none',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                  borderRadius: '2px',
                }
              }}
            >
              AI 와인 & 푸드 페어링
            </Typography>
            <FastfoodIcon sx={{ 
              fontSize: { xs: 32, md: 40 }, 
              color: '#FFD700',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} />
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 5,
              color: 'rgba(255, 255, 255, 0.92)',
              maxWidth: '650px',
              mx: 'auto',
              lineHeight: 1.5,
              fontWeight: 400,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            완벽한 조화를 이루는 주류와 음식의 궁합을 AI가 찾아드립니다
          </Typography>

          {/* 모던한 버튼 그룹 */}
          <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={handlePairingExplore}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1A1A1A',
                fontWeight: 700,
                borderRadius: '50px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                textTransform: 'none',
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                },
              }}
            >
              페어링 찾기
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleLiquorRecommendation}
              startIcon={<LocalBarIcon />}
              sx={{
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderColor: 'rgba(255, 215, 0, 0.6)',
                color: '#FFD700',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '2px solid rgba(255, 215, 0, 0.6)',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.15)',
                  color: '#FFA500',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              술 추천
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleIngredientRecommendation}
              startIcon={<RestaurantIcon />}
              sx={{
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderColor: 'rgba(255, 215, 0, 0.6)',
                color: '#FFD700',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '2px solid rgba(255, 215, 0, 0.6)',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.15)',
                  color: '#FFA500',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              음식 추천
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 주류 카테고리 슬라이더 */}
      <Box mb={6}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#2C2C2C',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            letterSpacing: '-0.02em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <LocalBarIcon sx={{ color: '#8B4513' }} />
          인기 주류
        </Typography>
        
        {/* 슬라이더 컨테이너 */}
        <Box sx={{ position: 'relative', px: 6 }}>
          {/* 왼쪽 화살표 */}
          <IconButton
            onClick={() => liquorSliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              color: '#8B4513',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* 슬라이더 */}
          <Slider ref={liquorSliderRef} {...sliderSettings}>
            {liquors.map((liquor) => (
              <Box key={liquor.id} sx={{ px: 1.5 }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '300px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #8B4513, #A0522D, #654321)',
                      borderRadius: '16px 16px 0 0',
                    }
                  }}
                  onClick={() => navigate('/pairing')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={liquor.imageUrl || 'https://via.placeholder.com/300x200?text=Wine'}
                    alt={liquor.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: 'sepia(10%) saturate(110%)',
                    }}
                  />
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {liquor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {liquor.type}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <IconButton
            onClick={() => liquorSliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              color: '#8B4513',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 음식 카테고리 슬라이더 */}
      <Box mb={6}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#2C2C2C',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            letterSpacing: '-0.02em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RestaurantIcon sx={{ color: '#228B22' }} />
          인기 음식
        </Typography>
        
        {/* 슬라이더 컨테이너 */}
        <Box sx={{ position: 'relative', px: 6 }}>
          {/* 왼쪽 화살표 */}
          <IconButton
            onClick={() => ingredientSliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(34, 139, 34, 0.1)',
              color: '#228B22',
              '&:hover': {
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* 슬라이더 */}
          <Slider ref={ingredientSliderRef} {...sliderSettings}>
            {ingredients.map((ingredient) => (
              <Box key={ingredient.id} sx={{ px: 1.5 }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '300px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #228B22, #32CD32, #006400)',
                      borderRadius: '16px 16px 0 0',
                    }
                  }}
                  onClick={() => navigate('/pairing')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={ingredient.imageUrl || 'https://via.placeholder.com/300x200?text=Food'}
                    alt={ingredient.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: 'sepia(5%) saturate(105%)',
                    }}
                  />
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {ingredient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ingredient.category}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <IconButton
            onClick={() => ingredientSliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(34, 139, 34, 0.1)',
              color: '#228B22',
              '&:hover': {
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 특징 섹션 - 와인 페어링 차트 스타일 */}
      <Paper 
        elevation={0}
        sx={{ 
          py: 6,
          px: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(248, 245, 238, 0.8) 0%, rgba(245, 241, 232, 0.9) 100%)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            color: '#2C2C2C',
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            letterSpacing: '-0.02em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          왜 AI 페어링인가요?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                AI 기반 분석
              </Typography>
              <Typography variant="body1" color="text.secondary">
                수천 가지 조합을 분석하여 과학적으로 검증된 최적의 페어링을 제안합니다
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: '#228B22', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                개인 맞춤형
              </Typography>
              <Typography variant="body1" color="text.secondary">
                개인의 취향과 선호도를 학습하여 점점 더 정확한 추천을 제공합니다
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <LocalBarIcon sx={{ fontSize: 48, color: '#B8860B', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                전문가 수준
              </Typography>
              <Typography variant="body1" color="text.secondary">
                소믈리에와 셰프들의 지식을 바탕으로 한 전문적인 페어링 정보를 제공합니다
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HomePage;