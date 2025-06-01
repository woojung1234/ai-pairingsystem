class KoreanPairingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }

  async predictPairing(koreanLiquor, koreanIngredient) {
    try {
      const response = await fetch(`${this.baseURL}/api/pairing/korean/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquor: koreanLiquor,
          ingredient: koreanIngredient
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '예측 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean pairing prediction error:', error);
      throw error;
    }
  }

  async getRecommendations(koreanLiquor, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/api/pairing/korean/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquor: koreanLiquor,
          limit
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '추천 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean recommendations error:', error);
      throw error;
    }
  }

  async searchItems(query, type = 'both') {
    try {
      const response = await fetch(
        `${this.baseURL}/api/pairing/korean/search?query=${encodeURIComponent(query)}&type=${type}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '검색 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean search error:', error);
      throw error;
    }
  }
}

export default new KoreanPairingService();