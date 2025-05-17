import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExploreIcon from '@mui/icons-material/Explore';
import '../styles/styles.css';

function HomePage() {
  const navigate = useNavigate();
  
  // 주류 카테고리 데이터
  const alcoholCategories = [
    { id: 1, title: "레드 와인", image: "/images/red-wine.jpg" },
    { id: 2, title: "화이트 와인", image: "/images/white-wine.jpg" },
    { id: 3, title: "위스키", image: "/images/whiskey.jpg" },
    { id: 4, title: "진", image: "/images/gin.jpg" },
  ];

  // 음식 카테고리 데이터
  const foodCategories = [
    { id: 1, title: "스테이크", image: "/images/steak.jpg" },
    { id: 2, title: "치즈", image: "/images/cheese.jpg" },
    { id: 3, title: "해산물", image: "/images/seafood.jpg" },
    { id: 4, title: "디저트", image: "/images/dessert.jpg" },
  ];

  // 페어링 페이지로 이동
  const handlePairingExplore = () => {
    navigate('/pairing');
  };

  // 카테고리 카드 클릭 핸들러
  const handleCategoryClick = (item, type) => {
    if (type === 'liquor') {
      navigate(`/pairing?liquorType=${encodeURIComponent(item.title)}`);
    } else {
      navigate(`/pairing?ingredientType=${encodeURIComponent(item.title)}`);
    }
  };

  return (
    <div>
      {/* 페어링 배너 - 검색 바 대신 버튼만 포함 */}
      <section className="pairing-banner">
        <h2 className="banner-title">마음에 딱 맞는 궁합이에요!</h2>
        
        <div className="banner-description">
          당신이 좋아하는 술과 음식의 완벽한 조합을 찾아보세요.<br />
          어떤 조합이 당신의 미각을 놀라게 할지 궁금하지 않으신가요?
        </div>
        
        <button 
          className="explore-button"
          onClick={handlePairingExplore}
        >
          <ExploreIcon className="explore-icon" />
          완벽한 페어링 찾기
        </button>
      </section>
      
      {/* 주류 카테고리 슬라이더 */}
      <section className="category-slider">
        {/* 제목 */}
        <h3 className="category-title">주류 카테고리</h3>
        
        {/* 왼쪽 화살표 */}
        <div className="slider-arrow left">
          <ArrowBackIosNewIcon className="slider-arrow-icon" fontSize="small" />
        </div>
        
        {/* 카테고리 카드 목록 */}
        <div className="slider-content">
          {alcoholCategories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCategoryClick(category, 'liquor')}
            >
              <img src={category.image} alt={category.title} />
              <div className="category-name">
                <span>{category.title}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* 오른쪽 화살표 */}
        <div className="slider-arrow right">
          <ArrowForwardIosIcon className="slider-arrow-icon" fontSize="small" />
        </div>
      </section>
      
      {/* 음식 카테고리 슬라이더 */}
      <section className="category-slider">
        {/* 제목 */}
        <h3 className="category-title">음식 카테고리</h3>
        
        {/* 왼쪽 화살표 */}
        <div className="slider-arrow left">
          <ArrowBackIosNewIcon className="slider-arrow-icon" fontSize="small" />
        </div>
        
        {/* 카테고리 카드 목록 */}
        <div className="slider-content">
          {foodCategories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCategoryClick(category, 'food')}
            >
              <img src={category.image} alt={category.title} />
              <div className="category-name">
                <span>{category.title}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* 오른쪽 화살표 */}
        <div className="slider-arrow right">
          <ArrowForwardIosIcon className="slider-arrow-icon" fontSize="small" />
        </div>
      </section>
    </div>
  );
}

export default HomePage;