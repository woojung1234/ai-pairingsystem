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

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#E5C989', 
    },
    secondary: {
      main: '#ff6f00', // Amber
    },
    background: {
      default: '#f5f5f5', // 기존 배경색 유지
    },
    text: {
      primary: '#E5C989',   // 주요 텍스트 색상을 베이지색으로 설정
      secondary: '#d4bb7a', // 보조 텍스트는 조금 더 어두운 베이지색으로
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
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
        <main style={{ minHeight: 'calc(100vh - 160px)', padding: '20px', marginTop: '40px' }}>
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
