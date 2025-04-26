import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFoundPage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          mt: 5,
          mb: 5
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            py: 5, 
            px: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            maxWidth: 600
          }}
        >
          <ErrorOutlineIcon color="primary" sx={{ fontSize: 100, mb: 2 }} />
          
          <Typography variant="h2" component="h1" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            페이지를 찾을 수 없습니다
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            찾으시는 페이지가 존재하지 않거나 이동되었습니다.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/"
              size="large"
            >
              홈으로 이동
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink}
              to="/pairing"
              size="large"
            >
              페어링 도구 사용하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default NotFoundPage;
