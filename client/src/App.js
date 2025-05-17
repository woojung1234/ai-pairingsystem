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
import LiquorPage from './pages/LiquorPage';
import LiquorDetailPage from './pages/LiquorDetailPage';
import IngredientPage from './pages/IngredientPage';
import IngredientDetailPage from './pages/IngredientDetailPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 고급 레스토랑 분위기를 위한 테마 설정
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B0000', // 짙은 레드
      light: '#A52A2A',
      dark: '#600000',
    },
    secondary: {
      main: '#DDB668', // 고급스러운 골드
      light: '#E5C989',
      dark: '#BE9B55',
    },
    background: {
      default: '#121212', // 어두운 다크 모드 배경
      paper: '#1E1E1E', // 어두운 카드 배경
    },
    text: {
      primary: '#F8F0E3', // 따뜻한 화이트
      secondary: 'rgba(248, 240, 227, 0.7)',
    },
    divider: 'rgba(221, 182, 104, 0.2)', // 반투명 골드
  },
  typography: {
    fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
    h1: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 700,
      fontSize: '3.75rem',
      letterSpacing: '0.02em',
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 600,
      fontSize: '3rem',
      letterSpacing: '0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '0.02em',
    },
    h4: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.8rem',
    },
    h5: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.4rem',
    },
    h6: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontWeight: 500,
      fontSize: '1.15rem',
    },
    body1: {
      fontFamily: "'Cormorant Garamond', 'Noto Sans KR', sans-serif",
      fontSize: '1.1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: "'Cormorant Garamond', 'Noto Sans KR', sans-serif",
      fontSize: '0.95rem',
      lineHeight: 1.7,
    },
    subtitle1: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    subtitle2: {
      fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
      fontSize: '1.1rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
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
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@import': "url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Serif+KR:wght@400;500;700&family=Noto+Sans+KR:wght@300;400;500&display=swap')",
        },
        'html, body': {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(to bottom, #121212, #1A1A1A)',
          minHeight: '100vh',
          color: '#F8F0E3',
        },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#121212',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(221, 182, 104, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(221, 182, 104, 0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '0.85rem 2rem',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          fontWeight: 500,
          position: 'relative',
          overflow: 'hidden',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #600000 0%, #8B0000 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #BE9B55 0%, #DDB668 100%)',
          color: '#121212',
        },
        outlinedSecondary: {
          borderColor: '#DDB668',
          color: '#DDB668',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(221, 182, 104, 0.15)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(18, 18, 18, 0.9)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 4,
          border: '1px solid rgba(221, 182, 104, 0.1)',
          overflow: 'hidden',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.75rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.15)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(221, 182, 104, 0.15)',
          '&::before, &::after': {
            borderColor: 'rgba(221, 182, 104, 0.15)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#DDB668',
          textDecoration: 'none',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            width: 0,
            height: '1px',
            backgroundColor: '#DDB668',
            transition: 'width 0.3s ease',
          },
          '&:hover': {
            color: '#E5C989',
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
            '& fieldset': {
              borderColor: 'rgba(221, 182, 104, 0.2)',
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(221, 182, 104, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#DDB668',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(248, 240, 227, 0.7)',
            '&.Mui-focused': {
              color: '#DDB668',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(221, 182, 104, 0.15)',
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
        <main style={{ minHeight: 'calc(100vh - 160px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pairing" element={<PairingPage />} />
            <Route path="/liquors" element={<LiquorPage />} />
            <Route path="/liquors/:id" element={<LiquorDetailPage />} />
            <Route path="/ingredients" element={<IngredientPage />} />
            <Route path="/ingredients/:id" element={<IngredientDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
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