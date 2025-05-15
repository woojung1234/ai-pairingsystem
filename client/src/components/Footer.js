import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WineBarIcon from '@mui/icons-material/WineBar';
import GitHubIcon from '@mui/icons-material/GitHub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        mt: 'auto',
        background: 'linear-gradient(to top, #0a0a0a, #1a1a1a)',
        color: theme.palette.text.secondary,
        pt: 6,
        pb: 4,
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WineBarIcon 
                sx={{ 
                  color: theme.palette.primary.main, 
                  mr: 1.5, 
                  fontSize: 32 
                }} 
              />
              <Typography 
                variant="h5" 
                component="div"
                sx={{
                  fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  letterSpacing: '0.02em',
                }}
              >
                찰떡궁합
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                maxWidth: 300,
                lineHeight: 1.8, 
                color: 'rgba(245, 240, 230, 0.7)',
              }}
            >
              플레이버 프로파일과 사용자 취향을 기반으로 완벽한 조합을 추천하는 설명 가능한 AI 기반 음식과 음료 페어링 시스템입니다.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <LocationOnIcon sx={{ fontSize: 20, mr: 1.5, color: 'rgba(212, 175, 55, 0.7)' }} />
              <Typography variant="body2" color="text.secondary">
                전북대학교 SW중심대학사업단
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ fontSize: 20, mr: 1.5, color: 'rgba(212, 175, 55, 0.7)' }} />
              <Typography variant="body2" color="text.secondary">
                jpseo99@joomidang.com
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: theme.palette.text.primary,
                fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                fontWeight: 600,
                position: 'relative',
                paddingBottom: 1.5,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 2,
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              네비게이션
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2 
              }}
            >
              <Link 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                홈
              </Link>
              <Link 
                component={RouterLink} 
                to="/pairing" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                페어링
              </Link>
              <Link 
                component={RouterLink} 
                to="/liquors" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                주류
              </Link>
              <Link 
                component={RouterLink} 
                to="/ingredients" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none', 
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                재료
              </Link>
              <Link 
                component={RouterLink} 
                to="/about" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                소개
              </Link>
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: 'rgba(245, 240, 230, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'block',
                  '&:hover': { color: theme.palette.secondary.main },
                }}
              >
                로그인
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: theme.palette.text.primary,
                fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                fontWeight: 600,
                position: 'relative',
                paddingBottom: 1.5,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 2,
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              리소스
            </Typography>
            
            <Link 
              href="https://github.com/gumwoo/ai-pairingsystem" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'rgba(245, 240, 230, 0.7)',
                textDecoration: 'none',
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                transition: 'color 0.3s ease',
                '&:hover': { color: theme.palette.secondary.main },
              }}
            >
              <GitHubIcon sx={{ mr: 1.5, fontSize: 20 }} />
              깃허브 저장소
            </Link>
            
            <Link 
              href="http://localhost:5004/api-docs" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'rgba(245, 240, 230, 0.7)',
                textDecoration: 'none',
                display: 'block', 
                mb: 2,
                transition: 'color 0.3s ease',
                '&:hover': { color: theme.palette.secondary.main },
              }}
            >
              API 문서
            </Link>
            
            <Link 
              component={RouterLink} 
              to="/privacy" 
              sx={{ 
                color: 'rgba(245, 240, 230, 0.7)',
                textDecoration: 'none',
                display: 'block', 
                mb: 2,
                transition: 'color 0.3s ease',
                '&:hover': { color: theme.palette.secondary.main },
              }}
            >
              개인정보 처리방침
            </Link>
            
            <Link 
              component={RouterLink} 
              to="/terms" 
              sx={{ 
                color: 'rgba(245, 240, 230, 0.7)',
                textDecoration: 'none',
                display: 'block',
                transition: 'color 0.3s ease',
                '&:hover': { color: theme.palette.secondary.main },
              }}
            >
              서비스 이용약관
            </Link>
          </Grid>
        </Grid>
        
        <Divider 
          sx={{ 
            my: 4, 
            backgroundColor: 'rgba(212, 175, 55, 0.1)' 
          }} 
        />
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            © {currentYear} 찰떡궁합. 모든 권리 보유.
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: { xs: 1, sm: 0 }, opacity: 0.7 }}
          >
            전북대학교 캡스톤 디자인 프로젝트
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;