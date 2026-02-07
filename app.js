const apiKey = "YOUR_API_KEY";
const cityName = "London";

const cityElement = document.getElementById("city");
const tempElement = document.getElementById("temperature");
const descElement = document.getElementById("description");
const iconElement = document.getElementById("icon");

function fetchWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  axios.get(url)
    .then(function(response) {
      const data = response.data;

      const city = data.name;
      const temperature = data.main.temp;
      const description = data.weather[0].description;
      const iconCode = data.weather[0].icon;

      cityElement.textContent = city;
      tempElement.textContent = `Temperature: ${temperature}°C`;
      descElement.textContent = `Condition: ${description}`;
      iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    })
    .catch(function(error) {
      console.error("Error fetching weather:", error);
      cityElement.textContent = "Failed to load weather data.";
    });
}

fetchWeather();
