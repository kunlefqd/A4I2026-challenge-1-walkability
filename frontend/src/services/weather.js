export const CHICAGO_WEATHER_FALLBACK = {
  provider: 'Open-Meteo fallback',
  summary: 'Hot and hazy',
  tempF: 94,
  feelsLikeF: 103,
  humidityPct: 52,
  windMph: 8,
  source: 'fallback'
};

const WEATHER_CODE_MAP = {
  0: 'Clear skies',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm'
};

function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

async function fetchWeatherFromGoogle() {
  const apiKey = import.meta.env.VITE_GOOGLE_WEATHER_API_KEY;
  if (!apiKey) return null;

  const endpoint = 'https://weather.googleapis.com/v1/currentConditions:lookup';
  const params = new URLSearchParams({
    key: apiKey,
    location: JSON.stringify({ latitude: 41.8781, longitude: -87.6298 })
  });

  const response = await fetch(`${endpoint}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Google Weather API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return {
    provider: 'Google Weather API',
    summary: data?.currentConditions?.condition?.text || 'Hot and hazy',
    tempF: data?.currentConditions?.temperature?.fahrenheit ?? CHICAGO_WEATHER_FALLBACK.tempF,
    feelsLikeF: data?.currentConditions?.feelsLikeTemperature?.fahrenheit ?? CHICAGO_WEATHER_FALLBACK.feelsLikeF,
    humidityPct: data?.currentConditions?.relativeHumidity ?? CHICAGO_WEATHER_FALLBACK.humidityPct,
    windMph: data?.currentConditions?.windSpeed?.mph ?? CHICAGO_WEATHER_FALLBACK.windMph,
    source: 'live'
  };
}

async function fetchWeatherFromOpenMeteo() {
  const params = new URLSearchParams({
    latitude: '41.8781',
    longitude: '-87.6298',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;
  const condition = WEATHER_CODE_MAP[current?.weather_code] || 'Hot and hazy';

  return {
    provider: 'Open-Meteo',
    summary: condition,
    tempF: toFahrenheit(current?.temperature_2m ?? 34),
    feelsLikeF: toFahrenheit(current?.apparent_temperature ?? 34),
    humidityPct: current?.relative_humidity_2m ?? 52,
    windMph: Math.round(current?.wind_speed_10m ?? 8),
    source: 'live'
  };
}

export async function fetchChicagoWeather() {
  const provider = import.meta.env.VITE_WEATHER_PROVIDER || 'open-meteo';

  try {
    if (provider === 'google') {
      const googleWeather = await fetchWeatherFromGoogle();
      if (googleWeather) return googleWeather;
    }

    return await fetchWeatherFromOpenMeteo();
  } catch (error) {
    console.warn('Weather fetch failed; using Chicago fallback values.', error);
    return CHICAGO_WEATHER_FALLBACK;
  }
}
