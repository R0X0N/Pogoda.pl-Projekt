const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const weatherCardsDiv2 = document.querySelector(".weather-cards2");
const errorContent = document.querySelector("[data-error-content]");
const error = document.querySelector("main");
const loader = document.getElementById("loader");
const content = document.getElementById("content");


const API_KEY = "abdc6aa984d531707faba27e8b0a44e1"; // API key for OpenWeatherMap API

window.addEventListener('load', () => {
    errorContent.style.display = "flex";
    const cityName = localStorage.getItem('storedValue');
    errorContent.style.display = "none";


    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        const {lat, lon, name} = data[0];
        getWeatherDetails(name, lat, lon);
    })
})


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const {lat, lon, name} = data[0];
        saveLoc(name);
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        error.style.display = "none";
        errorContent.style.display = "flex";
        console.log("Wystąpił błąd podczas pobierania współrzędnych!");
    });

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}&lang=pl`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const {name} = data[0];
                saveLoc(name);
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                error.style.display = "none";
                errorContent.style.display = "flex";
                console.log("Wystąpił błąd podczas pobierania nazwy miasta!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Żądanie geolokalizacji odrzucone. Zresetuj uprawnienia do lokalizacji, aby ponownie przyznać dostęp.");
            } else {
                alert("Błąd żądania geolokalizacji. Zresetuj uprawnienia do lokalizacji.");
            }
        });
}


const getWeatherDetails = (cityName, latitude, longitude) => {
    loader.style.display = "none";

    const urla = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pl&units=metric`;

    fetch(urla)
        .then((resp) => {
            if (!resp.ok) throw new Error(resp.statusText);
            return resp.json();
        })
        .then((data) => {
            createCurrentWeather(data);
        })
        .catch(console.err);


    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pl&units=metric`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            return uniqueForecastDays.push(forecastDate);
        });

        weatherCardsDiv.innerHTML = "";
        weatherCardsDiv2.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {

            if (index < 4) {
                const html = createWeatherCard(cityName, weatherItem, index);
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }

            if (index > 4 && index <= 8) {
                const html = createWeatherCard(cityName, weatherItem, index);
                weatherCardsDiv2.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        error.style.display = "none";
        errorContent.style.display = "flex";
        console.log("Wystąpił błąd podczas pobierania prognozy pogody!");
    });
    content.style.display = "block";

}

const createCurrentWeather = (data) => {

    const test = String(data.weather[0].description);
    const t = test[0].toUpperCase();
    const description = t + test.substring(1, test.length);

    function time(czas, strefa) {
        const date = new Date((czas + strefa) * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const t1 = hours.toString();
        const t2 = minutes.toString();

        return t1 + ":" + t2;

    }

    let row = document.querySelector('.current-weather');
    row.innerHTML = '';
    let html = `
            <p class="miejscowosc">${data.name}</p>
            <div class="temp">
                <img class="card-img" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png"
                     alt="weather-icon"
                     title="${description}"/>
                <a class="temp-val">${(data.main.temp).toFixed(1)}°<sup>c</sup></a>
            </div>
            <h3 class="card-title">${description}</h3>
            <a class="separator3"> </a>
            <p class="card-text"><span class="m-icon-a">humidity_percentage </span>Wilgotność: ${data.main.humidity}%</p>
            <p class="card-text"><span class="m-icon-a">airwave </span>Ciśnienie: ${data.main.pressure}hPa</p>
            <p class="card-text"><span class="m-icon-a">thermostat </span>Temp. Otocz. ${data.main.feels_like}°c</p>
            <p class="card-text"><span class="m-icon-a">air </span>Prd. wiatru: ${data.wind.speed}M/S</p>
            <p class="card-text"><span class="m-icon-a">visibility </span>Widoczność: ${(data.visibility / 1000).toFixed(1)}km</p>
            <p class="card-text"><span class="m-icon-a">clear_day </span>Wsc. słońca: ${time(data.sys.sunrise, data.timezone)}</p>
            <p class="card-text"><span class="m-icon-a">clear_night </span>Zach. słońca: ${time(data.sys.sunset, data.timezone)}</p>
            <a> </a>
`;

    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
}


const createWeatherCard = (cityName, weatherItem, index) => {
    const test = String(weatherItem.weather[0].description);
    const t = test[0].toUpperCase();
    const description = t + test.substring(1, test.length);

    function opad_at() {
        var atm;

        if (weatherItem.rain == undefined && weatherItem.snow == undefined) {
            return "Brak opad.";
        }

        if (weatherItem.rain == undefined) {
            const obj = weatherItem.snow;
            atm = JSON.stringify(obj);
            return atm.slice(6, 9) + "mm";
        } else {
            const obj = weatherItem.rain;
            atm = JSON.stringify(obj);
            return atm.slice(6, 9) + "mm";
        }
    }

    function data() {
        return weatherItem.dt_txt.slice(5, 16).replace("-", ".");
    }


    return `<div class="card">
                    <h3 class="tekst">${data()}</h3>
                    <img
                            alt="Weather description"
                            class="card-img-dz"
                            src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"
                            width="150px"
                            height="150px"
                            title="${description}"/>
                     <div class="separator4"></div>
                    <h6 class="te">Temperatura: ${(weatherItem.main.temp).toFixed(1)}°</h6>
                    <h6 class="te">Tem. Odcz: ${weatherItem.main.feels_like}°c</h6>
                    <h6 class="te">Ciśnienie: ${weatherItem.main.pressure}hPa</h6>
                    <h6 class="te">Wilgotność: ${weatherItem.main.humidity}%</h6>
                    <h6 class="te">Prd. wiatru: ${weatherItem.wind.speed}M/S</h6>
                    <h6 class="te">Opad atmos.: ${opad_at()}</h6>
                </div>`;
}

function saveLoc(inputValue) {
    localStorage.setItem('storedValue', inputValue);
}


locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());