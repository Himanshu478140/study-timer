import { useState, useEffect } from 'react';

interface WeatherInfo {
  city: string;
  temp: number;
  weather: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
}

const weatherCodes: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear Sky', icon: '☀️' },
  1: { text: 'Mainly Clear', icon: '🌤️' },
  2: { text: 'Partly Cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Foggy', icon: '🌫️' },
  48: { text: 'Rime Fog', icon: '🌫️' },
  51: { text: 'Light Drizzle', icon: '🌦️' },
  53: { text: 'Moderate Drizzle', icon: '🌦️' },
  55: { text: 'Dense Drizzle', icon: '🌦️' },
  61: { text: 'Slight Rain', icon: '🌧️' },
  63: { text: 'Moderate Rain', icon: '🌧️' },
  65: { text: 'Heavy Rain', icon: '🌧️' },
  71: { text: 'Slight Snow', icon: '🌨️' },
  73: { text: 'Moderate Snow', icon: '🌨️' },
  75: { text: 'Heavy Snow', icon: '🌨️' },
  80: { text: 'Rain Showers', icon: '🌧️' },
  81: { text: 'Heavy Rain Showers', icon: '🌧️' },
  82: { text: 'Violent Rain Showers', icon: '🌧️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const geoRes = await fetch('https://freeipapi.com/api/json');
        if (!geoRes.ok) throw new Error('Geo lookup failed');
        const geoData = await geoRes.json();
        
        const lat = geoData.latitude || 37.7749;
        const lon = geoData.longitude || -122.4194;
        const city = geoData.cityName || 'San Francisco';

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        if (!weatherRes.ok) throw new Error('Weather lookup failed');
        const weatherData = await weatherRes.json();

        const code = weatherData.current_weather.weathercode;
        const weatherMap = weatherCodes[code] || { text: 'Clear Sky', icon: '☀️' };
        
        setWeather({
          city,
          temp: Math.round(weatherData.current_weather.temperature),
          weather: weatherMap.text,
          minTemp: Math.round(weatherData.daily.temperature_2m_min[0]),
          maxTemp: Math.round(weatherData.daily.temperature_2m_max[0]),
          icon: weatherMap.icon
        });
      } catch (error) {
        console.warn('Could not fetch real weather, using gorgeous fallback:', error);
        setWeather({
          city: 'San Francisco',
          temp: 18,
          weather: 'Sunny Vibes',
          minTemp: 12,
          maxTemp: 22,
          icon: '☀️'
        });
      }
    };

    fetchWeather();
  }, []);

  if (!weather) return null;

  return (
    <div className="cardContainer animate-fade-in" style={{ marginTop: '0.25rem' }}>
      <div className="card">
        <p className="city">{weather.city}</p>
        <div style={{ fontSize: '1.8rem', margin: '0.1rem 0', userSelect: 'none' }}>{weather.icon}</div>
        <p className="weather">{weather.weather}</p>
        <p className="temp">{weather.temp}°</p>
        <div className="minmaxContainer">
          <div className="min">
            <p className="minHeading">Min</p>
            <p className="minTemp">{weather.minTemp}°</p>
          </div>
          <div className="max">
            <p className="maxHeading">Max</p>
            <p className="maxTemp">{weather.maxTemp}°</p>
          </div>
        </div>
      </div>
    </div>
  );
};
