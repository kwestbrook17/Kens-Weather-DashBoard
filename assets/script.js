const apiKey = 'e081453d5cd14b59d430abd509a4c04b';

function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            // Update the HTML elements with the fetched data
            const cityName = data.name;
            const date = new Date(data.dt * 1000).toLocaleDateString();
            const weatherIcon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
            const temperature = data.main.temp;
            const temperatureFahrenheit = (temperature * 9 / 5) + 32;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const windSpeedMilesPerHour = windSpeed * 2.237;

            const currentWeatherElement = document.querySelector('.current');
            currentWeatherElement.innerHTML = `
                        <h2>Current Weather</h2>
                        <div class="weather-card">
                            <h3>${cityName} - ${date}</h3>
                            <img src="${weatherIcon}" alt="${data.weather[0].description}">
                            <p>Temperature: ${temperatureFahrenheit} °f</p>
                            <p>Humidity: ${humidity}%</p>
                            <p>Wind Speed: ${windSpeedMilesPerHour} mph</p>
                        </div>
                    `;

            // Fetch 5-day forecast and update the forecast container
            updateFutureWeather(cityName);
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
        });
}

function updateFutureWeather(cityName) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = ''; // Clear previous forecast data

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(forecastUrl)
        .then((response) => response.json())
        .then((data) => {
            // Group forecasts by date
            const groupedForecasts = groupForecastsByDate(data.list);

            // Get the current date
            const currentDate = new Date().toLocaleDateString();

            for (const forecast of groupedForecasts) {
                const date = new Date(forecast[0].dt * 1000).toLocaleDateString();

                // Skip the forecast for the current date
                if (date === currentDate) {
                    continue;
                }

                const weatherIcon = `https://openweathermap.org/img/w/${forecast[0].weather[0].icon}.png`;
                const temperature = forecast[0].main.temp;
                const temperatureFahrenheit = (temperature * 9 / 5) + 32;
                const humidity = forecast[0].main.humidity;
                const windSpeed = forecast[0].wind.speed;
                const windSpeedMilesPerHour = windSpeed * 2.237;

                const forecastCard = document.createElement('div');
                forecastCard.classList.add('weather-card');
                forecastCard.innerHTML = `
                    <h3>${date}</h3>
                    <img src="${weatherIcon}" alt="${forecast[0].weather[0].description}">
                    <p>Temperature: ${temperatureFahrenheit.toFixed(2)} °F</p> <!-- Display temperature in Fahrenheit with 2 decimal places -->
                    <p>Humidity: ${humidity}%</p>
                    <p>Wind Speed: ${windSpeedMilesPerHour.toFixed(2)} mph</p> <!-- Display wind speed in mph with 2 decimal places -->
                `;
                forecastContainer.appendChild(forecastCard);
            }
        })
        .catch((error) => {
            console.error('Error fetching forecast data:', error);
        });
}

function groupForecastsByDate(forecasts) {
    // Helper function to group forecasts by date
    const groupedForecasts = forecasts.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(forecast);
        return acc;
    }, {});
    return Object.values(groupedForecasts);
}

function handleFormSubmit(event) {
    event.preventDefault();
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);

        // Save the searched city in the search history using local storage
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!searchHistory.includes(city)) {
            searchHistory.push(city);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            displaySearchHistory();
        }
    } else {
        alert('Please enter a city name.');
    }
}

function displaySearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const searchHistoryElement = document.getElementById('searchHistory');
    searchHistoryElement.innerHTML = '';
    searchHistory.forEach((city) => {
        const listItem = document.createElement('li');
        listItem.classList.add('city-in-history');

        // Create a clickable button for each city
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.classList.add('city-button');
        cityButton.addEventListener('click', () => {
            getWeatherData(city); 
        });

        listItem.appendChild(cityButton);
        searchHistoryElement.appendChild(listItem);
    });
}

const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', handleFormSubmit);

// Add event listener for search history elements to re-fetch weather data
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('city-in-history')) {
        const city = event.target.textContent;
        getWeatherData(city);
    }
});

// Display search history on page load
displaySearchHistory();

//clearing the list
function clearLocalStorage() {
    localStorage.clear();
    location.reload();
}

// Add event listener to the clear button
const clearButton = document.getElementById("Clear");
clearButton.addEventListener("click", clearLocalStorage);
