import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExploreIcon from '@mui/icons-material/Explore';
import '../styles/styles.css';

function HomePage() {
  const navigate = useNavigate();
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 슬라이더 참조 생성
  const liquorSliderRef = useRef(null);
  const foodSliderRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 주류 데이터 가져오기
        const liquorsResponse = await axios.get('/api/liquors');
        console.log('Liquors response:', liquorsResponse.data);
        
        // 재료 데이터 가져오기
        const ingredientsResponse = await axios.get('/api/ingredients');
        console.log('Ingredients response:', ingredientsResponse.data);
        
        // 응답 데이터 구조 확인 및 변환
        const liquorsData = Array.isArray(liquorsResponse.data) 
          ? liquorsResponse.data 
          : (liquorsResponse.data.data || []);
          
        const ingredientsData = Array.isArray(ingredientsResponse.data) 
          ? ingredientsResponse.data 
          : (ingredientsResponse.data.data || []);
        
        setLiquors(liquorsData);
        setIngredients(ingredientsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
        
        // API 호출 실패 시 샘플 데이터 사용
        setLiquors([
          { id: 1, name: "레드 와인", type: "와인", imageUrl: "/images/red-wine.jpg" },
          { id: 2, name: "화이트 와인", type: "와인", imageUrl: "/images/white-wine.jpg" },
          { id: 3, name: "위스키", type: "위스키", imageUrl: "/images/whiskey.jpg" },
          { id: 4, name: "진", type: "진", imageUrl: "/images/gin.jpg" },
          { id: 5, name: "보드카", type: "보드카", imageUrl: "/images/vodka.jpg" },
          { id: 6, name: "소주", type: "소주", imageUrl: "/images/soju.jpg" },
        ]);
        
        setIngredients([
          { id: 1, name: "스테이크", category: "육류", imageUrl: "/images/steak.jpg" },
          { id: 2, name: "치즈", category: "유제품", imageUrl: "/images/cheese.jpg" },
          { id: 3, name: "해산물", category: "해산물", imageUrl: "/images/seafood.jpg" },
          { id: 4, name: "디저트", category: "디저트", imageUrl: "/images/dessert.jpg" },
          { id: 5, name: "파스타", category: "면류", imageUrl: "/images/pasta.jpg" },
          { id: 6, name: "샐러드", category: "채소", imageUrl: "/images/salad.jpg" },
        ]);
      }
    };

    fetchData();
  }, []);

  // 페어링 페이지로 이동
  const handlePairingExplore = () => {
    navigate('/pairing');
  };

  // 카테고리 카드 클릭 핸들러
  const handleCategoryClick = (item, type) => {
    if (type === 'liquor') {
      navigate(`/pairing?liquorId=${item.id}`);
    } else {
      navigate(`/pairing?ingredientId=${item.id}`);
    }
  };

  // 슬라이더 설정
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <div>
      {/* 페어링 배너 - wine-glass.png를 배경으로 설정 */}
      <section className="pairing-banner" style={{
  position: 'relative',
  overflow: 'hidden',
  width: '100vw', // 뷰포트 너비의 100%로 확장
  marginLeft: 'calc(-50vw + 50%)', // 화면 중앙에서 양쪽으로 확장
  backgroundImage: 'url(/images/wine-bg.jpg)', // 배경 이미지 추가
  backgroundSize: 'contain',
  opacity: 1.0,
  backgroundPosition: 'center',
  boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.7)' // 어두운 오버레이
}}>
  {/* 와인잔 이미지는 그대로 중앙에 유지 */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/images/wine-glass.png)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'contain',
    opacity: 0.5,
    filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.15)) contrast(1.2)',
    zIndex: 0
  }}></div>
  
  {/* 배너 콘텐츠 */}
  <div style={{ 
    position: 'relative', 
    zIndex: 1,
    padding: '0 20px',
    maxWidth: '800px',
    margin: '0 auto'
  }}>
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
  </div>
</section>
      
      {/* 주류 카테고리 슬라이더 */}
      <section className="category-slider">
        {/* 제목 */}
        <h3 className="category-title">주류 카테고리</h3>
        
        {/* 슬라이더 및 화살표 */}
        <div style={{ position: 'relative', padding: '0 45px' }}>
          {/* 왼쪽 화살표 */}
          <div 
            className="slider-arrow left"
            onClick={() => liquorSliderRef.current?.slickPrev()}
          >
            <ArrowBackIosNewIcon className="slider-arrow-icon" fontSize="small" />
          </div>
          
          {/* 슬라이더 */}
          <Slider ref={liquorSliderRef} {...sliderSettings}>
            {liquors.map((liquor) => (
              <div key={liquor.id}>
                <div 
                  className="category-card"
                  onClick={() => handleCategoryClick(liquor, 'liquor')}
                  style={{ margin: '0 8px' }}
                >
                  <img src={liquor.imageUrl} alt={liquor.name} />
                  <div className="category-name">
                    <span>{liquor.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <div 
            className="slider-arrow right"
            onClick={() => liquorSliderRef.current?.slickNext()}
          >
            <ArrowForwardIosIcon className="slider-arrow-icon" fontSize="small" />
          </div>
        </div>
      </section>
      
      {/* 음식 카테고리 슬라이더 */}
      <section className="category-slider">
        {/* 제목 */}
        <h3 className="category-title">음식 카테고리</h3>
        
        {/* 슬라이더 및 화살표 */}
        <div style={{ position: 'relative', padding: '0 45px' }}>
          {/* 왼쪽 화살표 */}
          <div 
            className="slider-arrow left"
            onClick={() => foodSliderRef.current?.slickNext()}
          >
            <ArrowBackIosNewIcon className="slider-arrow-icon" fontSize="small" />
          </div>
          
          {/* 슬라이더 */}
          <Slider ref={foodSliderRef} {...sliderSettings}>
            {ingredients.map((ingredient) => (
              <div key={ingredient.id}>
                <div 
                  className="category-card"
                  onClick={() => handleCategoryClick(ingredient, 'food')}
                  style={{ margin: '0 8px' }}
                >
                  <img src={ingredient.imageUrl} alt={ingredient.name} />
                  <div className="category-name">
                    <span>{ingredient.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <div 
            className="slider-arrow right"
            onClick={() => foodSliderRef.current?.slickNext()}
          >
            <ArrowForwardIosIcon className="slider-arrow-icon" fontSize="small" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;