import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import GitHubIcon from '@mui/icons-material/GitHub';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalBarIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                AI 페어링 시스템
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              플레이버 프로파일과 사용자 취향을 기반으로 완벽한 조합을 추천하도록 설계된 설명 가능한 AI 기반 음식과 음료 페어링 시스템입니다.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              네비게이션
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              홈
            </Link>
            <Link component={RouterLink} to="/pairing" color="inherit" sx={{ display: 'block', mb: 1 }}>
              페어링
            </Link>
            <Link component={RouterLink} to="/liquors" color="inherit" sx={{ display: 'block', mb: 1 }}>
              주류
            </Link>
            <Link component={RouterLink} to="/ingredients" color="inherit" sx={{ display: 'block', mb: 1 }}>
              재료
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" sx={{ display: 'block', mb: 1 }}>
              소개
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              리소스
            </Typography>
            <Link href="https://github.com/gumwoo/ai-pairingsystem" color="inherit" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GitHubIcon sx={{ mr: 1 }} fontSize="small" />
              깃허브 저장소
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              API 문서
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              개인정보 처리방침
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              서비스 이용약관
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          © {new Date().getFullYear()} AI 페어링 시스템. 모든 권리 보유.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
