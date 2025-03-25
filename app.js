
const apiKey = "adf472717719f12c92c2244d06cb2618";

class WeatherApp {
  constructor() {
    this.initializeElements();
    this.addEventListeners();
    this.animateInitialLoad();
    this.setupExport();
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
    this.forecastGraph = document.getElementById('forecast-graph');
    this.aqi = document.getElementById('aqi');
    this.uvIndex = document.getElementById('uv-index');
    this.visibility = document.getElementById('visibility');
    this.moonPhase = document.getElementById('moon-phase');
    this.weatherCards = document.querySelectorAll('.weather-card');
    this.exportBtn = document.getElementById('export-btn');
    this.lineGraphSvg = document.getElementById('line-graph-svg');
    this.lineGraphContainer = document.getElementById('line-graph-container');
  }

  addEventListeners() {
    this.searchBtn.addEventListener('click', () => this.fetchWeatherData());
    this.cityInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.fetchWeatherData();
    });
  }

  setupExport() {
    this.exportBtn.addEventListener('click', () => this.exportToWord());
  }

  exportToWord() {
    const weatherData = this.getWeatherDataForExport();
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Exported Weather Data</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + weatherData + footer;
    const sourceBlob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    saveAs(sourceBlob, 'weather_data.doc');
  }

  getWeatherDataForExport() {
    const cityName = this.cityName.textContent;
    const currentDate = this.currentDate.textContent;
    const temperature = this.temperature.textContent;
    const feelsLike = this.feelsLike.textContent;
    const weatherDescription = this.weatherDescription.textContent;
    const humidity = this.humidity.textContent;
    const windSpeed = this.windSpeed.textContent;
    const windDirection = this.windDirection.textContent;
    const pressure = this.pressure.textContent;
    const sunriseTime = this.sunriseTime.textContent;
    const sunsetTime = this.sunsetTime.textContent;
    const aqi = this.aqi.textContent;
    const uvIndex = this.uvIndex.textContent;
    const visibility = this.visibility.textContent;
    const moonPhase = this.moonPhase.textContent;
    const forecast = this.forecastContainer.innerHTML;
    const weatherDataHTML = `
    <div>City: ${cityName}</div>
    <div>Date: ${currentDate}</div>
    <div>Temperature: ${temperature}</div>
    <div>Feels Like: ${feelsLike}</div>
    <div>Description: ${weatherDescription}</div>
    <div>Humidity: ${humidity}</div>
    <div>Wind Speed: ${windSpeed}</div>
    <div>Wind Direction: ${windDirection}</div>
    <div>Pressure: ${pressure}</div>
    <div>Sunrise: ${sunriseTime}</div>
    <div>Sunset: ${sunsetTime}</div>
    <div>AQI: ${aqi}</div>
    <div>UV Index: ${uvIndex}</div>
    <div>Visibility: ${visibility}</div>
    <div>Moon Phase: ${moonPhase}</div>
    <div><h3>Forecast</h3>${forecast}</div>
    `;
    return weatherDataHTML;
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
    this.weatherCards.forEach(card => card.classList.add('loading'));

    try {
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!currentWeatherResponse.ok) {
        throw new Error('City not found');
      }
      const currentWeather = await currentWeatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const forecastData = await forecastResponse.json();

      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoResponse.json();

      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${geoData[0].lat}&lon=${geoData[0].lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
      );
      const oneCallData = await oneCallResponse.json();

      this.weatherCards.forEach(card => card.classList.remove('loading'));

      this.updateUI(currentWeather, forecastData, oneCallData);
      this.animateWeatherUpdate();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      this.weatherCards.forEach(card => card.classList.remove('loading'));
      if (error.message === 'City not found') {
        console.log("City not found")
      }
    }
  }

  animateWeatherUpdate() {
    const elementsToAnimate = [
      this.cityName,
      this.temperature,
      this.weatherIcon,
      this.forecastContainer,
      this.forecastGraph,
      this.lineGraphContainer
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
    this.updateForecastGraph(currentWeather, forecastData);
    this.updateLineGraph(currentWeather, forecastData);
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
    this.sunriseTime.textContent = this.formatTime(data.sys.sunrise * 1000);
    this.sunsetTime.textContent = this.formatTime(data.sys.sunset * 1000);
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

  updateLineGraph(currentWeather, forecastData) {
    this.lineGraphSvg.innerHTML = ''; // Clear previous graph

    // Example data (replace with your actual data extraction logic)
    const dailyData = this.groupForecastByDay(forecastData.list).slice(0, 5);
    const currentTemp = currentWeather.main.temp;
    const lineGraphData = [
      Math.round(currentTemp),
      Math.round((dailyData[0].main.temp_max + currentTemp) / 2),
      Math.round((currentTemp + dailyData[0].main.temp_min) / 2),
      Math.round((dailyData[0].main.temp_min + dailyData[0].main.temp_max) / 2),
      Math.round(dailyData[0].main.temp)
    ];
    const lineGraphLabels = dailyData.map(day => this.formatDayName(new Date(day.dt * 1000)));
    lineGraphLabels.unshift("Today");

    // Create the line graph
    this.createLineGraph(lineGraphData, lineGraphLabels);
  }

  createLineGraph(data, labels) {
    const svg = this.lineGraphSvg;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = 50;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue;
    const numPoints = data.length;
    const xStep = (width - 2 * padding) / (numPoints - 1);

    // Y-axis label
    const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yAxisLabel.setAttribute("class", "axis-label y-axis-label");
    yAxisLabel.setAttribute("x", -height / 2);
    yAxisLabel.setAttribute("y", padding / 2);
    yAxisLabel.textContent = "Temperature (°C)";
    svg.appendChild(yAxisLabel);

    // X-axis label
    const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xAxisLabel.setAttribute("class", "axis-label x-axis-label");
    xAxisLabel.setAttribute("x", width / 2);
    xAxisLabel.setAttribute("y", height - padding / 4);
    xAxisLabel.textContent = "Days";
    svg.appendChild(xAxisLabel);

    // Create points for the line
    const points = data.map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - minValue) / valueRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    // Draw the line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("class", "line");
    line.setAttribute("points", points);
    svg.appendChild(line);

    // Draw dots and labels
    data.forEach((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - minValue) / valueRange) * (height - 2 * padding);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "dot");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", 5);
      svg.appendChild(dot);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "line-label");
      label.setAttribute("x", x);
      label.setAttribute("y", y - 10);
      label.textContent = `${value}°C`;
      svg.appendChild(label);

      const dayLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      dayLabel.setAttribute("class", "line-label");
      dayLabel.setAttribute("x", x);
      dayLabel.setAttribute("y", height - padding + 20);
      dayLabel.textContent = labels[index];
      svg.appendChild(dayLabel);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();

  const currentHour = new Date().getHours();

  if (!isNaN(currentHour)) {
    let sunPositionPercentage = (currentHour / 24) * 100;
    sunPositionPercentage = Math.sin((sunPositionPercentage / 100) * Math.PI - (Math.PI / 2)) * 50 + 50;
    document.documentElement.style.setProperty('--sun-position', `${sunPositionPercentage}%`);
  }

  const sunElement = document.querySelector('.sun');
  sunElement.style.animation = 'none';

  const dateTimeElement = document.getElementById('date-time');
  setInterval(() => {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString();
  }, 1000);
});
function generateRandomLineGraph() {
    const svg = document.getElementById("line-graph-svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "300");
    
    const width = 500;
    const height = 300;
    const numPoints = 10;
    let points = [];

    for (let i = 0; i < numPoints; i++) {
        let x = (i / (numPoints - 1)) * width;
        let y = Math.random() * height;
        points.push(`${x},${y}`);
    }

    let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points.join(" "));
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "blue");
    polyline.setAttribute("stroke-width", "2");

    svg.innerHTML = ""; // Clear previous graph
    svg.appendChild(polyline);
}

generateRandomLineGraph();

