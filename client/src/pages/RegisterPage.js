import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person
} from '@mui/icons-material';
import { registerUser } from '../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: ''
  });
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'agreeTerms' ? checked : value;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }));
    
    // Clear the error when the user starts typing again
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: ''
    };
    let isValid = true;
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = '사용자 이름이 필요합니다';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = '사용자 이름은 최소 3자 이상이어야 합니다';
      isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = '이메일이 필요합니다';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = '비밀번호가 필요합니다';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다';
      isValid = false;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }
    
    // Terms agreement validation
    if (!formData.agreeTerms) {
      errors.agreeTerms = '이용약관에 동의해야 합니다';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Remove confirmPassword and agreeTerms before sending to API
      const { confirmPassword, agreeTerms, ...registerData } = formData;
      
      // This would be a real API call in a production app
      const response = await registerUser(registerData);
      console.log('Registration successful:', response);
      
      setSuccessMessage('회원가입이 성공했습니다! 이제 로그인할 수 있습니다.');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            계정 만들기
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            AI 페어링에 가입하여 즐겨찾기한 페어링을 저장하고 개인화된 추천을 받아보세요
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="사용자 이름"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.agreeTerms} 
                  onChange={handleChange} 
                  name="agreeTerms" 
                  color="primary" 
                />
              }
              label="이용약관에 동의합니다"
              sx={{ mt: 2 }}
            />
            {formErrors.agreeTerms && (
              <Typography variant="caption" color="error">
                {formErrors.agreeTerms}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? '계정 생성 중...' : '회원가입'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  이미 계정이 있으신가요? 로그인하기
                </Link>
              </Grid>
            </Grid>
            
            <Divider sx={{ mt: 4, mb: 4 }}>
              <Typography variant="body2" color="textSecondary">
                또는
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ mb: 2 }}
              component={RouterLink}
              to="/"
            >
              게스트로 계속하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default RegisterPage;
