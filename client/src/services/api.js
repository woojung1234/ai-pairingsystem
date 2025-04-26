import axios from 'axios';

// Create an axios instance with default configs
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API endpoints for liquors
export const getLiquors = async (page = 1, limit = 20) => {
  try {
    const response = await API.get(`/liquors?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching liquors:', error);
    throw error;
  }
};

export const getLiquorById = async (id) => {
  try {
    const response = await API.get(`/liquors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching liquor with ID ${id}:`, error);
    throw error;
  }
};

export const searchLiquors = async (query) => {
  try {
    const response = await API.get(`/liquors/search/${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching liquors:', error);
    throw error;
  }
};

// API endpoints for ingredients
export const getIngredients = async (page = 1, limit = 20) => {
  try {
    const response = await API.get(`/ingredients?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    throw error;
  }
};

export const getIngredientById = async (id) => {
  try {
    const response = await API.get(`/ingredients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ingredient with ID ${id}:`, error);
    throw error;
  }
};

export const searchIngredients = async (query) => {
  try {
    const response = await API.get(`/ingredients/search/${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching ingredients:', error);
    throw error;
  }
};

export const getIngredientsByCategory = async (category) => {
  try {
    const response = await API.get(`/ingredients/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ingredients by category ${category}:`, error);
    throw error;
  }
};

// API endpoints for pairings
export const getPairingScore = async (liquorId, ingredientId) => {
  try {
    const response = await API.get(`/pairing/score/${liquorId}/${ingredientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pairing score for liquor ${liquorId} and ingredient ${ingredientId}:`, error);
    throw error;
  }
};

export const getRecommendations = async (liquorId, limit = 10) => {
  try {
    const response = await API.get(`/pairing/recommendations/${liquorId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommendations for liquor ${liquorId}:`, error);
    throw error;
  }
};

export const getPairingExplanation = async (liquorId, ingredientId) => {
  try {
    const response = await API.get(`/pairing/explanation/${liquorId}/${ingredientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching explanation for liquor ${liquorId} and ingredient ${ingredientId}:`, error);
    throw error;
  }
};

// API endpoints for users (would require auth token in a real app)
export const registerUser = async (userData) => {
  try {
    const response = await API.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/profile?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await API.put(`/users/preferences?userId=${userId}`, preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export default API;
