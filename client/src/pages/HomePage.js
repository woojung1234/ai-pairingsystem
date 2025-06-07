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
  Fastfood as FastfoodIcon,
} from '@mui/icons-material';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        
        setLiquors(liquorsData.slice(0, 8)); // 상위 8개만
        setIngredients(ingredientsData.slice(0, 8)); // 상위 8개만
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
          { id: 7, name: "사케", type: "사케", imageUrl: "/images/sake.jpg" },
          { id: 8, name: "맥주", type: "맥주", imageUrl: "/images/beer.jpg" },
        ]);
        
        setIngredients([
          { id: 1, name: "스테이크", category: "육류", imageUrl: "/images/steak.jpg" },
          { id: 2, name: "치즈", category: "유제품", imageUrl: "/images/cheese.jpg" },
          { id: 3, name: "해산물", category: "해산물", imageUrl: "/images/seafood.jpg" },
          { id: 4, name: "디저트", category: "디저트", imageUrl: "/images/dessert.jpg" },
          { id: 5, name: "파스타", category: "면류", imageUrl: "/images/pasta.jpg" },
          { id: 6, name: "샐러드", category: "채소", imageUrl: "/images/salad.jpg" },
          { id: 7, name: "과일", category: "과일", imageUrl: "/images/fruit.jpg" },
          { id: 8, name: "견과류", category: "견과류", imageUrl: "/images/nuts.jpg" },
        ]);
      }
    };

    fetchData();
  }, []);

  // 페어링 페이지로 이동
  const handlePairingExplore = () => {
    navigate('/pairing');
  };

  // 카테고리 카드 클릭 핸들러
  const handleCategoryClick = (item, type) => {
    if (type === 'liquor') {
      navigate(`/liquors/${item.id}`);
    } else {
      navigate(`/ingredients/${item.id}`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section - 와인 페어링 차트 스타일 */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 6,
          py: 8,
          px: 4,
          borderRadius: 4,
          background: `
            linear-gradient(135deg, 
              rgba(245, 241, 232, 0.9) 0%, 
              rgba(248, 245, 238, 0.95) 50%, 
              rgba(251, 248, 241, 0.9) 100%
            ),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23D4AF37" opacity="0.1"/><circle cx="80" cy="40" r="1.5" fill="%238B4513" opacity="0.1"/><circle cx="40" cy="70" r="1" fill="%23228B22" opacity="0.1"/><circle cx="70" cy="80" r="2.5" fill="%23B8860B" opacity="0.1"/></svg>')
          `,
          backgroundSize: '100px 100px',
          border: '2px solid rgba(139, 69, 19, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 69, 19, 0.02) 10px, rgba(139, 69, 19, 0.02) 20px)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box textAlign="center" position="relative" zIndex={1}>
          {/* 제목에 아이콘들 추가 */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
            <LocalBarIcon sx={{ fontSize: 40, color: '#8B4513' }} />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #654321 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
              }}
            >
              AI 와인 & 푸드 페어링
            </Typography>
            <FastfoodIcon sx={{ fontSize: 40, color: '#228B22' }} />
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4,
              color: '#5D4037',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            완벽한 조화를 이루는 주류와 음식의 궁합을 AI가 찾아드립니다
          </Typography>

          {/* 버튼 그룹 - 와인 테마 색상 */}
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
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              페어링 찾기
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/liquors')}
              startIcon={<LocalBarIcon />}
              sx={{
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderColor: '#228B22',
                color: '#228B22',
                '&:hover': {
                  borderColor: '#32CD32',
                  backgroundColor: 'rgba(34, 139, 34, 0.05)',
                },
              }}
            >
              주류 탐색
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/ingredients')}
              startIcon={<RestaurantIcon />}
              sx={{
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderColor: '#B8860B',
                color: '#B8860B',
                '&:hover': {
                  borderColor: '#DAA520',
                  backgroundColor: 'rgba(184, 134, 11, 0.05)',
                },
              }}
            >
              음식 탐색
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 주류 카테고리 섹션 */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: '#3E2723',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocalBarIcon sx={{ color: '#8B4513' }} />
            인기 주류
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/liquors')}
            sx={{ color: '#8B4513' }}
          >
            전체 보기
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {liquors.map((liquor) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={liquor.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
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
                onClick={() => handleCategoryClick(liquor, 'liquor')}
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
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 음식 카테고리 섹션 */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: '#3E2723',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <RestaurantIcon sx={{ color: '#228B22' }} />
            인기 음식
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/ingredients')}
            sx={{ color: '#228B22' }}
          >
            전체 보기
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {ingredients.map((ingredient) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ingredient.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
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
                onClick={() => handleCategoryClick(ingredient, 'ingredient')}
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
            </Grid>
          ))}
        </Grid>
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
            fontWeight: 600,
            color: '#3E2723',
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