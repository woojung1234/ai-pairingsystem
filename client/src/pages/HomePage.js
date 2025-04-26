import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Paper
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import PsychologyIcon from '@mui/icons-material/Psychology';

function HomePage() {
  const features = [
    {
      icon: <LocalBarIcon sx={{ fontSize: 40 }} />,
      title: "종합적인 주류 데이터베이스",
      description: "세계 각국의 다양한 주류 콜렉션을 탐험해보세요. 상세한 플레이버 프로파일과 원산지 정보가 포함되어 있습니다."
    },
    {
      icon: <FastfoodIcon sx={{ fontSize: 40 }} />,
      title: "재료 매칭",
      description: "상호 보완적인 플레이버 화합물과 전문가 추천을 기반으로 좋아하는 술과 완벽한 조합을 이루는 재료를 발견하세요."
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "설명 가능한 AI",
      description: "특정 조합이 잘 어울리는 이유를 이해해보세요. 우리의 투명한 AI 시스템이 각 추천 뒤에 숨은 과학을 설명합니다."
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('/images/hero-bg.jpg')`, // Would need to add an image
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
          }}
        >
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            완벽한 페어링을 찾아보세요
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            AI 기반 추천 시스템으로 최고의 음식과 음료 조합을 발견해보세요.
            플레이버 과학과 사용자 취향을 기반으로 잊지 못할 음식 경험을 만들어 드립니다.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/pairing"
            sx={{ mt: 2 }}
          >
            시작하기
          </Button>
        </Box>
      </Paper>

      {/* Features Section */}
      <Typography variant="h3" gutterBottom align="center" sx={{ mt: 8, mb: 4 }}>
        주요 기능
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works Section */}
      <Typography variant="h3" gutterBottom align="center" sx={{ mt: 8, mb: 4 }}>
        사용 방법
      </Typography>
      
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                1. 주류 또는 재료 선택
              </Typography>
              <Typography paragraph>
                좋아하는 술이나 함께 페어링하고 싶은 재료를 선택하여 시작하세요.
                음료로 시작하거나 음식으로 시작하거나 둘 다 가능합니다.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                2. AI 기반 추천 받기
              </Typography>
              <Typography paragraph>
                우리의 고급 AI 모델은 수천 가지의 잠재적 조합을 분석하여 플레이버 화합물, 전통적인 페어링, 사용자 취향을 고려하여 최적의 조합을 추천합니다.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                3. 페어링 배후의 과학 이해하기
              </Typography>
              <Typography paragraph>
                각 추천에는 이러한 플레이버가 왜 잘 어울리는지에 대한 상세한 설명이 제공되어, 새로운 조합을 발견하면서 플레이버 과학에 대해 배울 수 있습니다.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src="/images/how-it-works.jpg" // Would need to add an image
              alt="How it works illustration"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          p: 6,
          borderRadius: 2,
          color: 'white',
          textAlign: 'center',
          mb: 8
        }}
      >
        <Typography variant="h4" gutterBottom>
          놀라운 페어링을 발견할 준비가 되셨나요?
        </Typography>
        <Typography variant="subtitle1" paragraph>
          주류와 재료 데이터베이스를 탐색하여 완벽한 조합을 찾아보세요.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={RouterLink}
          to="/pairing"
          sx={{ mt: 2 }}
        >
          페어링 도구 지금 사용해보기
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;
