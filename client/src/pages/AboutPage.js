import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

function AboutPage() {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          AI 페어링 시스템 소개
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          인공지능과 데이터 과학의 힘을 통해 사람들이 음식과 음료 페어링을 발견하는 방식을 혁신하려는 우리의 사명에 대해 알아보세요.
        </Typography>
      </Box>

      {/* Main content */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            우리의 사명
          </Typography>
          <Typography paragraph>
            AI 페어링에서는 완벽한 음식과 음료의 조합을 찾는 것이 요리 전문가뿐만 아니라 모든 사람이 접근하기 쉽고 즐거운 경험이 되어야 한다고 믿습니다.
          </Typography>
          <Typography paragraph>
            우리의 사명은 최첨단 AI 기술과 수세기에 걸친 요리 지혜를 결합하여 플레이버 페어링의 과학을 이해하기 쉽게 만들고, 누구나 감각을 즐겁게 하는 놀라운 맛의 조합을 쉽게 발견할 수 있도록 하는 것입니다.
          </Typography>
          <Typography paragraph>
            전문 바텐더, 가정 요리사, 또는 단순히 맛있는 음식과 음료를 즐기는 사람이든, 우리 시스템은 플레이버 화합물의 과학적 분석, 문화적 전통, 사용자 선호도를 기반으로 개인화된 추천을 제공합니다.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="/images/about-hero.jpg" // Would need an actual image
            alt="Cocktail pairing with food"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3
            }}
          />
        </Grid>
      </Grid>

      {/* How it Works Section */}
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          우리의 기술이 작동하는 방법
        </Typography>
        <Typography align="center" paragraph sx={{ mb: 4 }}>
          AI 페어링은 당사의 독점 FlavorDiffusion 모델을 통해 구동되며, 그래프 신경망과 요리 전문 지식을 결합하여 강력한 추천 시스템을 만듭니다.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <ScienceIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  화학적 분석
                </Typography>
                <Typography align="center">
                  우리 시스템은 음식과 음료에서 발견되는 수천 가지의 화학 화합물을 분석하여 플레이버 프로파일의 조화를 이루는 공통 요소를 찾아냅니다.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <PsychologyIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  머신러닝
                </Typography>
                <Typography align="center">
                  우리의 AI 모델은 전통적인 페어링, 전문가 추천, 그리고 사용자 피드백을 통해 학습하여 추천과 설명을 지속적으로 개선합니다.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', color: 'primary.main' }}>
                <TipsAndUpdatesIcon sx={{ fontSize: 60 }} />
              </Box>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  설명 가능한 AI
                </Typography>
                <Typography align="center">
                  블랙박스 시스템과 달리, 우리의 기술은 특정 페어링이 왜 잘 작동하는지에 대한 명확한 설명을 제공하여 사용자가 이해하고 새로운 조합을 발견할 수 있도록 도와드립니다.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Our Data Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          우리의 데이터
        </Typography>
        <Typography paragraph>
          AI 페어링 시스템은 다음과 같은 포괄적인 데이터셋을 기반으로 구축되었습니다:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <DataObjectIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="화학 화합물 데이터베이스" 
              secondary="향과 맛에 기여하는 음식과 음료에 포함된 1,000개 이상의 휘발성 화합물"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocalBarIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="광범위한 주류 카탈로그" 
              secondary="지역적 변형을 포함한 모든 주요 카테고리의 수백 가지 주류에 대한 상세한 프로파일"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="요리 지식 베이스" 
              secondary="전 세계 다양한 요리 전통에서 기인한 전통적인 페어링"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GroupsIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="사용자 선호 데이터" 
              secondary="우리 시스템이 집단 지혜를 통해 학습하도록 도와주는 익명화된 피드백과 평가"
            />
          </ListItem>
        </List>

        <Typography paragraph sx={{ mt: 2 }}>
          모든 데이터는 최고 품질의 추천을 보장하기 위해 음식 과학자, 믹솔로지스트, AI 연구원으로 구성된 우리 팀에 의해 윤리적으로 수집되고 정리됩니다.
        </Typography>
      </Box>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          우리 팀
        </Typography>
        <Typography paragraph sx={{ mb: 4 }}>
          AI 페어링은 플레이버 페어링 영역을 혁신하는데 진정성을 가진 연구원, 엔지니어, 요리 전문가로 구성된 팀에 의해 개발되었습니다.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-1.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                에밀리 첸 박사
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                수석 데이터 과학자
                </Typography>
                <Typography variant="body2">
                플레이버 화합물 분석 전문성을 갖춘 식품 과학 박사
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-2.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                마이클 로드리게스
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                수석 엔지니어
                </Typography>
                <Typography variant="body2">
                AI 시스템 및 그래프 신경망 전문가
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-3.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                소피아 마르티네즈
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                요리 디렉터
                </Typography>
                <Typography variant="body2">
                글로벌 스피릿에 전문성을 갖춘 수상 경력의 믹솔로지스트
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="280"
                image="/images/team-4.jpg" // Would need an actual image
                alt="Team member"
              />
              <CardContent>
                <Typography variant="h6">
                제임스 윌슨 박사
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                연구 책임자
                </Typography>
                <Typography variant="body2">
                감각 과학 및 플레이버 인식 전문가
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          mb: 8
        }}
      >
        <Typography variant="h4" gutterBottom>
          놀라운 페어링을 발견할 준비가 되셨나요?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          주류와 재료 데이터베이스를 탐색하여 완벽한 조합을 찾아보세요.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          component={RouterLink}
          to="/pairing"
        >
          페어링 도구 사용하기
        </Button>
      </Paper>

      {/* FAQ Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          자주 묻는 질문
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            추천의 정확도는 어떠한가요?
          </Typography>
          <Typography paragraph>
            우리 시스템은 가리운 테스트에서 전문 솔멤리에와 믹솔로지스트 추천과 85% 이상 일치하는 결과를 보여줍니다. 모델은 사용자 피드백과 새로운 연구를 기반으로 지속적으로 개선됩니다.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            전문적인 목적으로 사용할 수 있나요?
          </Typography>
          <Typography paragraph>
            어뗄걸요! 많은 바텐더, 요리사, 음식 산업 전문가들이 새로운 조합을 발견하고 레퍼토리를 확장하기 위해 우리 시스템을 사용합니다.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            AI가 어떻게 추천을 설명하나요?
          </Typography>
          <Typography paragraph>
            우리 AI는 공통 플레이버 화합물, 플레이버 강도, 문화적 전통, 사용자 취향을 분석하여 과학적으로 정확하면서도 이해하기 쉽게 설명을 생성합니다.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            계정을 만들어야 하나요?
          </Typography>
          <Typography paragraph>
            기본 기능은 계정 없이 사용할 수 있지만, 무료 계정을 만들면 즐겨찾기한 페어링 저장, 개인화된 추천 제공, 피드백 기여와 같은 기능을 사용할 수 있습니다.
          </Typography>
        </Box>
      </Box>

      {/* Contact Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          문의하기
        </Typography>
        <Typography paragraph>
          질문, 제안 또는 피드백이 있으시나요? 연락해주세요.
        </Typography>
        <Typography paragraph>
          이메일: contact@aipairing.com
        </Typography>
        <Typography paragraph>
          소셜 미디어에서 팔로우하세요: @AIPairing
        </Typography>
      </Box>
    </Container>
  );
}

export default AboutPage;
