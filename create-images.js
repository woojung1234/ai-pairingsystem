const fs = require('fs');
const { createCanvas } = require('canvas');

// 보드카 이미지 생성
function createVodkaImage() {
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 배경 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#e8f4f8');
  gradient.addColorStop(1, '#c9e6f2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 보드카 병 그리기
  ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
  
  // 병 목 부분
  ctx.beginPath();
  ctx.moveTo(width * 0.4, height * 0.2);
  ctx.lineTo(width * 0.6, height * 0.2);
  ctx.lineTo(width * 0.55, height * 0.3);
  ctx.lineTo(width * 0.45, height * 0.3);
  ctx.closePath();
  ctx.fill();
  
  // 병 몸통 부분
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.3);
  ctx.lineTo(width * 0.65, height * 0.3);
  ctx.lineTo(width * 0.65, height * 0.8);
  ctx.lineTo(width * 0.35, height * 0.8);
  ctx.closePath();
  
  // 그림자 효과
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  
  ctx.fill();
  
  // 그림자 효과 초기화
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // 라벨 추가
  ctx.fillStyle = '#2e86c1';
  ctx.fillRect(width * 0.37, height * 0.4, width * 0.26, height * 0.25);
  
  // 텍스트 추가
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PREMIUM', width / 2, height * 0.48);
  ctx.fillText('VODKA', width / 2, height * 0.55);

  // 이미지를 파일로 저장
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync('./client/public/images/vodka.jpg', buffer);
  console.log('Vodka image created successfully');
}

// 팀 멤버 이미지 생성
function createTeamMemberImage() {
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 배경 설정
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  
  // 배경 장식 효과
  ctx.fillStyle = '#e0e0e0';
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 50 + 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 단순화된 인물 실루엣 그리기
  ctx.fillStyle = '#555555';
  
  // 머리 부분
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.3, width * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // 몸통 부분
  ctx.beginPath();
  ctx.moveTo(width * 0.4, height * 0.45);
  ctx.lineTo(width * 0.6, height * 0.45);
  ctx.lineTo(width * 0.65, height * 0.8);
  ctx.lineTo(width * 0.35, height * 0.8);
  ctx.closePath();
  ctx.fill();
  
  // 어깨 부분
  ctx.beginPath();
  ctx.moveTo(width * 0.3, height * 0.5);
  ctx.lineTo(width * 0.7, height * 0.5);
  ctx.lineTo(width * 0.65, height * 0.6);
  ctx.lineTo(width * 0.35, height * 0.6);
  ctx.closePath();
  ctx.fill();

  // 이미지를 파일로 저장
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync('./client/public/images/team-3.jpg', buffer);
  console.log('Team member image created successfully');
}

// 두 이미지 모두 생성
createVodkaImage();
createTeamMemberImage();
