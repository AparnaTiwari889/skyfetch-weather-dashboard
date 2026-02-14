const API_KEY = "YOUR_API_KEY_HERE";

function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentContainer = document.getElementById("recent-container");
    this.clearBtn = document.getElementById("clear-history");

    this.recentSearches = [];

    this.init();
}

WeatherApp.prototype.init = function () {

    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.clearBtn.addEventListener(
        "click",
        this.clearHistory.bind(this)
    );

    this.loadRecentSearches();
    this.loadLastCity();
};

WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    this.showLoading();
    this.getWeather(city);
};

WeatherApp.prototype.getWeather = function (city) {

    const weatherUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const forecastUrl =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
    ])
        .then(([weatherRes, forecastRes]) => {

            this.displayWeather(weatherRes.data);

            const forecast =
                this.processForecastData(forecastRes.data);

            this.displayForecast(forecast);

            this.saveRecentSearch(weatherRes.data.name);

            localStorage.setItem(
                "lastCity",
                weatherRes.data.name
            );
        })
        .catch(() => {
            this.showError("City not found. Try again.");
        });
};

WeatherApp.prototype.displayWeather = function (data) {

    const icon =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="${icon}" class="weather-icon">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
        <div id="forecast-container" class="forecast-container"></div>
    `;
};

WeatherApp.prototype.processForecastData = function (data) {

    return data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);
};

WeatherApp.prototype.displayForecast = function (forecastData) {

    const container =
        document.getElementById("forecast-container");

    container.innerHTML = "";

    forecastData.forEach(day => {

        const date =
            new Date(day.dt_txt)
                .toDateString()
                .slice(0, 10);

        const icon =
            `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

        container.innerHTML += `
            <div class="forecast-card">
                <h4>${date}</h4>
                <img src="${icon}">
                <p>${Math.round(day.main.temp)}°C</p>
            </div>
        `;
    });
};

/* ================= RECENT SEARCH ================= */

WeatherApp.prototype.saveRecentSearch = function (city) {

    city = city
        .toLowerCase()
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

    this.recentSearches =
        this.recentSearches.filter(c => c !== city);

    this.recentSearches.unshift(city);

    this.recentSearches =
        this.recentSearches.slice(0, 5);

    localStorage.setItem(
        "recentCities",
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();
};

WeatherApp.prototype.loadRecentSearches = function () {

    const stored =
        localStorage.getItem("recentCities");

    if (stored) {
        this.recentSearches = JSON.parse(stored);
        this.displayRecentSearches();
    }
};

WeatherApp.prototype.displayRecentSearches = function () {

    this.recentContainer.innerHTML = "";

    this.recentSearches.forEach(city => {

        const btn = document.createElement("button");
        btn.textContent = city;
        btn.classList.add("recent-btn");

        btn.addEventListener("click", () => {
            this.cityInput.value = city;
            this.getWeather(city);
        });

        this.recentContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {

    const lastCity =
        localStorage.getItem("lastCity");

    if (lastCity) {
        this.cityInput.value = lastCity;
        this.getWeather(lastCity);
    }
};

WeatherApp.prototype.clearHistory = function () {

    localStorage.removeItem("recentCities");

    this.recentSearches = [];

    this.displayRecentSearches();
};

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML =
        `<p class="loading">Loading weather data...</p>`;
};

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML =
        `<p class="loading">${message}</p>`;
};

const app = new WeatherApp(API_KEY);
