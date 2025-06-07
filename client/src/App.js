import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PairingPage from './pages/PairingPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 와인 페어링 차트 스타일 테마
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // 갈색 (와인병 색상)
      light: '#A0522D',
      dark: '#654321',
    },
    secondary: {
      main: '#228B22', // 녹색 (화이트 와인 계열)
      light: '#32CD32',
      dark: '#006400',
    },
    tertiary: {
      main: '#B8860B', // 골든로드 (샴페인 계열)
      light: '#DAA520',
      dark: '#8B7355',
    },
    background: {
      default: '#F5F1E8', // 베이지/크림 배경
      paper: '#FEFCF7', // 더 밝은 카드 배경
    },
    text: {
      primary: '#3E2723', // 어두운 갈색 텍스트
      secondary: '#5D4037',
    },
    divider: 'rgba(139, 69, 19, 0.2)', // 갈색 계열 구분선
    wine: {
      red: '#8B0000', // 레드 와인
      white: '#F5DEB3', // 화이트 와인
      rose: '#FFC0CB', // 로제 와인
      champagne: '#F7E7CE', // 샴페인
      dessert: '#DDA0DD', // 디저트 와인
    },
  },
  typography: {
    fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
    h1: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 700,
      fontSize: '3.75rem',
      letterSpacing: '0.02em',
      lineHeight: 1.1,
      color: '#3E2723',
    },
    h2: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 600,
      fontSize: '3rem',
      letterSpacing: '0.02em',
      lineHeight: 1.2,
      color: '#3E2723',
    },
    h3: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '0.02em',
      color: '#3E2723',
    },
    h4: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.8rem',
      color: '#3E2723',
    },
    h5: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.4rem',
      color: '#3E2723',
    },
    h6: {
      fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.15rem',
      color: '#3E2723',
    },
    body1: {
      fontFamily: "'Cormorant Garamond', 'Noto Sans KR', sans-serif",
      fontSize: '1.1rem',
      lineHeight: 1.7,
      color: '#3E2723',
    },
    body2: {
      fontFamily: "'Cormorant Garamond', 'Noto Sans KR', sans-serif",
      fontSize: '0.95rem',
      lineHeight: 1.7,
      color: '#5D4037',
    },
    subtitle1: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: '#5D4037',
    },
    subtitle2: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontSize: '1.1rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: '#5D4037',
    },
    button: {
      fontFamily: "'Cormorant Garamond', 'Noto Sans KR', sans-serif",
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    overline: {
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      color: '#8B4513',
    },
  },
  shape: {
    borderRadius: 12, // 더 둥근 모서리
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@import': "url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Noto+Serif+KR:wght@400;500;700&family=Noto+Sans+KR:wght@300;400;500&display=swap')",
        },
        'html, body': {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#F5F1E8',
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(245, 241, 232, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(248, 245, 238, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(251, 248, 241, 0.6) 0%, transparent 50%)
          `,
          minHeight: '100vh',
          color: '#3E2723',
        },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#F5F1E8',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(139, 69, 19, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(139, 69, 19, 0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25, // 둥근 버튼
          padding: '0.85rem 2.5rem',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          fontWeight: 600,
          position: 'relative',
          overflow: 'hidden',
          textTransform: 'none',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(139, 69, 19, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(139, 69, 19, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(139, 69, 19, 0.05)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          color: '#FEFCF7',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
          color: '#FEFCF7',
        },
        outlinedPrimary: {
          borderColor: '#8B4513',
          color: '#8B4513',
        },
        outlinedSecondary: {
          borderColor: '#228B22',
          color: '#228B22',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(139, 69, 19, 0.1)',
          borderBottom: 'none',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(254, 252, 247, 0.95)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FEFCF7',
          backgroundImage: 'linear-gradient(145deg, #FEFCF7 0%, #FAF7F0 100%)',
          borderRadius: 16,
          border: '1px solid rgba(139, 69, 19, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 15px 40px rgba(139, 69, 19, 0.15)',
            borderColor: 'rgba(139, 69, 19, 0.2)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FEFCF7',
          backgroundImage: 'none',
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 14px rgba(139, 69, 19, 0.08)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(139, 69, 19, 0.12)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(139, 69, 19, 0.15)',
          '&::before, &::after': {
            borderColor: 'rgba(139, 69, 19, 0.15)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#8B4513',
          textDecoration: 'none',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            width: 0,
            height: '2px',
            backgroundColor: '#8B4513',
            transition: 'width 0.3s ease',
          },
          '&:hover': {
            color: '#A0522D',
            textDecoration: 'none',
            '&::after': {
              width: '100%',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FEFCF7',
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.2)',
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B4513',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(62, 39, 35, 0.7)',
            '&.Mui-focused': {
              color: '#8B4513',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '0.85rem',
        },
        filled: {
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          color: '#8B4513',
        },
        outlined: {
          borderColor: 'rgba(139, 69, 19, 0.3)',
          color: '#8B4513',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: '0.75em',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            color: '#5D4037',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1.1rem',
          },
          '& .MuiTab-root.Mui-selected': {
            color: '#8B4513',
            fontWeight: 600,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#8B4513',
            height: 3,
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#B8860B', // 골든로드 색상
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Function to handle login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <main style={{ 
          minHeight: 'calc(100vh - 160px)', 
          padding: '20px', 
          marginTop: '40px',
          background: 'transparent'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pairing" element={<PairingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;