const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/error');
const { accessLogger, errorLogger, developmentLogger } = require('./middleware/logger');

// Import routes
const pairingRoutes = require('./routes/pairing');
const userRoutes = require('./routes/user');
const ingredientRoutes = require('./routes/ingredient');
const liquorRoutes = require('./routes/liquor');

// Import database connection and initialization
const connectDB = require('./config/db');
const initDatabase = require('./config/db-init');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(accessLogger);
  app.use(errorLogger);
} else {
  app.use(developmentLogger);
}

// Connect to MongoDB and initialize database if needed
connectDB()
  .then(() => {
    console.log('MongoDB connected');
    return initDatabase();
  })
  .then(() => {
    console.log('Database initialization checked');
  })
  .catch(err => console.error('MongoDB setup error:', err));

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!require('fs').existsSync(logsDir)) {
  require('fs').mkdirSync(logsDir, { recursive: true });
}

// Routes
app.use('/api/pairing', pairingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/liquors', liquorRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Pairing System API' });
});

// Error handling middleware (should be after all routes)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route not found: ${req.originalUrl}` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

module.exports = app;
