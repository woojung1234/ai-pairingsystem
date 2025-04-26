# AI-based Explainable Pairing System

An AI-powered web service that recommends optimal food and drink pairings based on user preferences and situational context.

## Overview

This project utilizes AI to create an explainable recommendation system for food and drink pairings. The system analyzes flavor compounds and profiles to suggest the best combinations, while providing clear explanations for why certain pairings work well together.

## Features

- **AI-based Recommendation**: Uses FlavorDiffusion model to recommend optimal pairings
- **Explainable AI**: Provides transparent explanations for pairing recommendations
- **Comprehensive Database**: Includes extensive collection of liquors and ingredients
- **User Preferences**: Takes into account user preferences and history
- **Interactive UI**: Clean, intuitive interface for exploring pairings

## Tech Stack

- **Frontend**: React
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB
- **AI Model**: FlavorDiffusion (GNN-based model)
- **Deployment**: Docker containers and AWS

## Project Structure

```
ai-pairing/
├── ai-server/               # AI model and training code
│   ├── dataset/             # Dataset files
│   ├── model/               # Model implementation
│   ├── api.py               # FastAPI server for model serving
│   └── Dockerfile.model     # Docker configuration for AI service
│
├── client/                  # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── assets/          # Images, styles, etc.
│   ├── Dockerfile           # Docker configuration for frontend
│   └── nginx.conf           # Nginx configuration
│
├── server/                  # Express.js backend
│   ├── src/                 # Source code
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── ai/              # AI model integration
│   └── Dockerfile           # Docker configuration for backend
│
└── docker-compose.yml       # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.9+
- MongoDB
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/gumwoo/ai-pairingsystem.git
   cd ai-pairingsystem
   ```

2. Install dependencies
   ```
   npm run install-all
   ```

3. Set up environment variables
   ```
   cp server/.env.example server/.env
   # Edit .env with your configuration
   ```

4. Start the development servers
   ```
   npm start
   ```

### Docker Deployment

1. Build and start the containers
   ```
   docker-compose up -d
   ```

2. Access the services
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - AI Model API: http://localhost:8000

## Data Sources

- **FlavorDB**: Database of flavor molecules
- **WineReview**: Wine review and pairing data
- **Recipe1M**: Recipe dataset for ingredient relationships

## Model Training

The FlavorDiffusion model is trained on a graph of liquors, ingredients, and the compounds they share. The model learns to predict compatibility scores between liquors and ingredients based on their chemical properties and historical pairing data.

To train the model from scratch:

```
cd ai-server
python model/train.py
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FlavorDB for providing the compound data
- All contributors who have helped with development
