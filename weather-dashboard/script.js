// Replace with your OpenWeatherMap API key from https://openweathermap.org/api
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default city on page load
window.addEventListener('DOMContentLoaded', () => {
    searchWeatherByCoords();
});

// Enter key to search
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Get weather by coordinates (geolocation)
function searchWeatherByCoords() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            () => {
                // Default to a city if geolocation fails
                document.getElementById('cityInput').value = 'London';
                searchWeather();
            }
        );
    } else {
        document.getElementById('cityInput').value = 'London';
        searchWeather();
    }
}

// Search weather by city name
function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherByCity(city);
}

// Fetch weather by city name
function fetchWeatherByCity(city) {
    showLoading();
    
    fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            showError(error.message);
        });
}

// Fetch weather by coordinates
function fetchWeatherByCoords(lat, lon) {
    showLoading();
    
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchForecast(lat, lon);
            document.getElementById('cityInput').value = data.name;
        })
        .catch(error => {
            showError(error.message);
        });
}

// Fetch 5-day forecast
function fetchForecast(lat, lon) {
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

// Display current weather
function displayCurrentWeather(data) {
    hideLoading();
    hideError();

    const { main, weather, wind, clouds, visibility, sys } = data;
    const weatherIcon = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

    // Update weather information
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weatherDescription').textContent = weather[0].description;
    document.getElementById('temperature').textContent = Math.round(main.temp);
    document.getElementById('feelsLike').textContent = Math.round(main.feels_like);
    document.getElementById('humidity').textContent = main.humidity;
    document.getElementById('pressure').textContent = main.pressure;
    document.getElementById('windSpeed').textContent = wind.speed.toFixed(1);
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1);
    document.getElementById('weatherIcon').src = weatherIcon;
    document.getElementById('uvIndex').textContent = 'N/A'; // UV index requires separate API call

    document.getElementById('currentWeather').style.display = 'block';
}

// Display 5-day forecast
function displayForecast(forecastData) {
    const forecastCards = document.getElementById('forecastCards');
    forecastCards.innerHTML = '';

    // Get forecast for every 8th item (one per day at 12:00)
    const dailyForecasts = forecastData.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].description;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="date">${day}</div>
            <img src="${icon}" alt="weather icon" class="icon" style="width: 60px; height: 60px;">
            <div class="temp">${temp}°C</div>
            <div class="description">${description}</div>
        `;

        forecastCards.appendChild(card);
    });

    document.getElementById('forecast').style.display = 'block';
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('currentWeather').style.display = 'none';
    document.getElementById('forecast').style.display = 'none';
    hideError();
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `Error: ${message}`;
    errorDiv.style.display = 'block';
    document.getElementById('currentWeather').style.display = 'none';
    document.getElementById('forecast').style.display = 'none';
    hideLoading();
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}