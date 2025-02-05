fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/chennai?unitGroup=us&key=BRS46DDHQV9NRWCLQMNPHJPAV&contentType=json", {
  "method": "GET",
  "headers": {
  }
  })
.then(response => {
  console.log(response);
})
.catch(err => {
  console.error(err);
});

class WeatherApp {
  constructor() {
    this.initializeElements();
    this.addEventListeners();
    this.animateInitialLoad();
  }

  initializeElements() {
    this.cityInput = document.getElementById('city-input');
    this.searchBtn = document.getElementById('search-btn');
    this.cityName = document.getElementById('city-name');
    this.currentDate = document.getElementById('current-date');
    this.temperature = document.getElementById('temperature');
    this.feelsLike = document.getElementById('feels-like');
    this.weatherIcon = document.getElementById('weather-icon');
    this.weatherDescription = document.getElementById('weather-description');
    this.humidity = document.getElementById('humidity');
    this.windSpeed = document.getElementById('wind-speed');
    this.windDirection = document.getElementById('wind-direction');
    this.pressure = document.getElementById('pressure');
    this.sunriseTime = document.getElementById('sunrise-time');
    this.sunsetTime = document.getElementById('sunset-time');
    this.forecastContainer = document.getElementById('extended-forecast-container');
    
    // New elements
    this.aqi = document.getElementById('aqi');
    this.uvIndex = document.getElementById('uv-index');
    this.visibility = document.getElementById('visibility');
    this.moonPhase = document.getElementById('moon-phase');

    this.weatherCards = document.querySelectorAll('.weather-card');
  }

  addEventListeners() {
    this.searchBtn.addEventListener('click', () => this.fetchWeatherData());
    this.cityInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.fetchWeatherData();
    });
  }

  animateInitialLoad() {
    this.weatherCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  async fetchWeatherData() {
    const city = this.cityInput.value;
    
    // Add loading state
    this.weatherCards.forEach(card => card.classList.add('loading'));

    try {
      // Current Weather
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const currentWeather = await currentWeatherResponse.json();

      // Forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const forecastData = await forecastResponse.json();

      // Geocoding to get lat and lon for additional API calls
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoResponse.json();
      
      // One Call API for more detailed data
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${geoData[0].lat}&lon=${geoData[0].lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
      );
      const oneCallData = await oneCallResponse.json();

      // Remove loading state
      this.weatherCards.forEach(card => card.classList.remove('loading'));

      this.updateUI(currentWeather, forecastData, oneCallData);
      this.animateWeatherUpdate();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('City not found. Please try again.');
      
      // Remove loading state
      this.weatherCards.forEach(card => card.classList.remove('loading'));
    }
  }

  animateWeatherUpdate() {
    // Add subtle animations to update
    const elementsToAnimate = [
      this.cityName, 
      this.temperature, 
      this.weatherIcon, 
      this.forecastContainer
    ];

    elementsToAnimate.forEach(el => {
      el.style.transition = 'all 0.5s ease';
      el.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 500);
    });
  }

  updateUI(currentWeather, forecastData, oneCallData) {
    this.updateCurrentWeather(currentWeather, oneCallData);
    this.updateExtendedForecast(forecastData);
    this.updateBackground(currentWeather.weather[0].main);
  }

  updateCurrentWeather(data, oneCallData) {
    this.cityName.textContent = data.name;
    this.currentDate.textContent = this.formatDate(new Date());
    this.temperature.textContent = `${Math.round(data.main.temp)}°C`;
    this.feelsLike.textContent = `Feels Like: ${Math.round(data.main.feels_like)}°C`;
    this.weatherIcon.innerHTML = this.getWeatherIcon(data.weather[0].main);
    this.weatherDescription.textContent = data.weather[0].description;
    this.humidity.textContent = `${data.main.humidity}%`;
    this.windSpeed.textContent = `${data.wind.speed} km/h`;
    this.windDirection.textContent = this.getWindDirection(data.wind.deg);
    this.pressure.textContent = `${data.main.pressure} hPa`;
    
    // Sunrise and sunset times
    this.sunriseTime.textContent = this.formatTime(data.sys.sunrise * 1000);
    this.sunsetTime.textContent = this.formatTime(data.sys.sunset * 1000);

    // Additional environmental data
    this.aqi.textContent = this.formatAQI(oneCallData.current.air_quality?.us_epa_index || 0);
    this.uvIndex.textContent = oneCallData.current.uvi || '-';
    this.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    this.moonPhase.textContent = this.getMoonPhase(oneCallData.daily[0].moon_phase);
  }

  formatAQI(index) {
    const aqiDescriptions = {
      0: 'N/A',
      1: 'Good',
      2: 'Moderate',
      3: 'Unhealthy for Sensitive Groups',
      4: 'Unhealthy',
      5: 'Very Unhealthy',
      6: 'Hazardous'
    };
    return aqiDescriptions[index] || 'N/A';
  }

  getMoonPhase(phase) {
    const moonPhases = {
      0: 'New Moon',
      0.25: 'First Quarter',
      0.5: 'Full Moon',
      0.75: 'Last Quarter'
    };
    return moonPhases[Math.round(phase * 4) / 4] || 'Waxing/Waning';
  }

  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  updateExtendedForecast(data) {
    this.forecastContainer.innerHTML = '';
    const dailyData = this.groupForecastByDay(data.list);
    
    dailyData.slice(0, 5).forEach(day => {
      const forecastDay = document.createElement('div');
      forecastDay.classList.add('forecast-day');
      
      const dayName = this.formatDayName(new Date(day.dt * 1000));
      
      forecastDay.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div>${this.getWeatherIcon(day.weather[0].main)}</div>
        <div class="forecast-temp">
          <span class="temp-high">H: ${Math.round(day.main.temp_max)}°C</span>
          <span class="temp-low">L: ${Math.round(day.main.temp_min)}°C</span>
        </div>
        <p>${day.weather[0].description}</p>
      `;
      
      this.forecastContainer.appendChild(forecastDay);
    });
  }

  groupForecastByDay(forecastList) {
    const dailyData = {};
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = item;
      } else {
        // Update max and min temperatures
        dailyData[date].main.temp_max = Math.max(dailyData[date].main.temp_max || item.main.temp, item.main.temp_max || item.main.temp);
        dailyData[date].main.temp_min = Math.min(dailyData[date].main.temp_min || item.main.temp, item.main.temp_min || item.main.temp);
      }
    });
    return Object.values(dailyData);
  }

  formatDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  updateBackground(weatherCondition) {
    const backgrounds = {
      'Clear': 'linear-gradient(135deg, #00d2ff, #3498db)',
      'Clouds': 'linear-gradient(135deg, #708090, #36486b)',
      'Rain': 'linear-gradient(135deg, #4b6cb7, #182848)',
      'Snow': 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
      'Thunderstorm': 'linear-gradient(135deg, #1a2a6c, #b21f1f)',
      'Drizzle': 'linear-gradient(135deg, #89f7fe, #66a6ff)',
      'Mist': 'linear-gradient(135deg, #708090, #36486b)'
    };
    document.body.style.background = backgrounds[weatherCondition] || backgrounds['Clear'];
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getWeatherIcon(weatherCondition) {
    const icons = {
      'Clear': '<span class="animated-icon">☀️</span>',
      'Clouds': '<span class="animated-icon">☁️</span>',
      'Rain': '<span class="animated-icon">🌧️</span>',
      'Snow': '<span class="animated-icon">❄️</span>',
      'Thunderstorm': '<span class="animated-icon">⛈️</span>',
      'Drizzle': '<span class="animated-icon">🌦️</span>',
      'Mist': '<span class="animated-icon">🌫️</span>'
    };
    return icons[weatherCondition] || '<span class="animated-icon">❓</span>';
  }
}

// Initialize the app when the DOM is fully loaded

// ... (Other code from WeatherApp class)

document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();

  // Get the current hour (0-23)
  const currentHour = new Date().getHours();

 if (isNaN(currentHour)) {
    console.error("Error: Unable to retrieve current hour.");
  } else {
    // Calculate sun position percentage safely
    let sunPositionPercentage = (currentHour / 24) * 100;
    sunPositionPercentage = Math.sin((sunPositionPercentage / 100) * Math.PI - (Math.PI / 2)) * 50 + 50;

    // Set the CSS variable
    document.documentElement.style.setProperty('--sun-position', `${sunPositionPercentage}%`);
  }

  // Disable sun animation
  const sunElement = document.querySelector('.sun');
  sunElement.style.animation = 'none';

    // Update the time and date
    const dateTimeElement = document.getElementById('date-time');
    setInterval(() => {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString();
    }, 1000); // Update every second
});


