import React from 'react';
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
import IngredientPage from './pages/IngredientPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#8e24aa', // Purple
    },
    secondary: {
      main: '#ff6f00', // Amber
    },
    background: {
      default: '#f5f5f5',
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header />
        <main style={{ minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pairing" element={<PairingPage />} />
            <Route path="/liquors" element={<LiquorPage />} />
            <Route path="/ingredients" element={<IngredientPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
