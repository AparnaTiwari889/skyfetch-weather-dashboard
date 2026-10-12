// ==========================================
// Weather App - OOP Version with Forecast
// ==========================================

// Replace with your real OpenWeatherMap API key
const API_KEY = "YOUR_API_KEY_HERE";

// ==========================================
// Constructor Function
// ==========================================
function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // Store DOM references (query once = better performance)
    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.init();
}

// ==========================================
// Initialize App
// ==========================================
WeatherApp.prototype.init = function () {
    // Search button click
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    // Press Enter key
    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

// ==========================================
// Welcome Message
// ==========================================
WeatherApp.prototype.showWelcome = function () {
    const welcomeHTML = `
        <div class="welcome-message">
            <h2>🌤 Welcome to Weather App</h2>
            <p>Enter a city name to see current weather and 5-day forecast.</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;
};

// ==========================================
// Handle Search
// ==========================================
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    this.showLoading();
    this.getWeather(city);
};

// ==========================================
// Fetch Weather + Forecast
// ==========================================
WeatherApp.prototype.getWeather = function (city) {
    const weatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
    ])
        .then(([weatherRes, forecastRes]) => {
            this.displayWeather(weatherRes.data);

            const processedForecast =
                this.processForecastData(forecastRes.data);

            this.displayForecast(processedForecast);
        })
        .catch((error) => {
            console.error("API Error:", error);
            this.showError(
                "Could not fetch weather data. Please try again."
            );
        });
};

// ==========================================
// Display Current Weather
// ==========================================
WeatherApp.prototype.displayWeather = function (data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
        <div id="forecast-container" class="forecast-container"></div>
    `;

    this.weatherDisplay.innerHTML = weatherHTML;
};

// ==========================================
// Process Forecast Data (5 Days at 12 PM)
// ==========================================
WeatherApp.prototype.processForecastData = function (data) {
    const dailyForecast = [];

    data.list.forEach((item) => {
        if (item.dt_txt.includes("12:00:00")) {
            dailyForecast.push(item);
        }
    });

    return dailyForecast.slice(0, 5);
};

// ==========================================
// Display Forecast Cards
// ==========================================
WeatherApp.prototype.displayForecast = function (forecastData) {
    const container =
        document.getElementById("forecast-container");

    forecastData.forEach((day) => {
        const date = new Date(day.dt_txt)
            .toDateString()
            .slice(0, 10);

        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

        const card = `
            <div class="forecast-card">
                <h4>${date}</h4>
                <img src="${iconUrl}" alt="forecast icon">
                <p>${temp}°C</p>
            </div>
        `;

        container.innerHTML += card; // append
    });
};

// ==========================================
// Show Loading
// ==========================================
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML =
        `<p class="loading">Loading weather data...</p>`;
};

// ==========================================
// Show Error
// ==========================================
WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML =
        `<p class="loading">${message}</p>`;
};

// ==========================================
// Create App Instance
// ==========================================
const app = new WeatherApp(API_KEY);
