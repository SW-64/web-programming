import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// JSON 파일에서 명언 데이터 불러오기
const quotes = JSON.parse(
  fs.readFileSync('src/data/mood_quotes.json', 'utf-8'),
);

// 랜덤 명언 추출 함수
function getQuoteByCategory(key) {
  const list = quotes[key] || [];
  if (list.length === 0) return '무언가 말하고 싶지만, 떠오르지 않아.';
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

router.get('/', async (req, res, next) => {
  const city = req.query.city || 'Seoul';
  const mood = req.query.mood || 'confused';

  try {
    // 날씨 API 호출
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherURL);
    const weatherData = await weatherRes.json();
    const weatherMain =
      weatherData.weather?.[0]?.main?.toLowerCase() || 'default';

    // 기분과 날씨에 따른 명언 두 개 조합
    const moodQuote = getQuoteByCategory(mood);
    const weatherQuote = getQuoteByCategory(weatherMain);

    res.json({
      city,
      mood,
      weather: weatherMain,
      quotes: [weatherQuote, moodQuote],
    });
  } catch (error) {
    console.error('날씨 또는 명언 생성 오류:', error);
    res.status(500).json({ error: '명언을 생성하지 못했습니다.' });
  }
});

export default router;
