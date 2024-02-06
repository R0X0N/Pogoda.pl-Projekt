const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".horizontal-scroll-wrapper");
const locationDis = document.querySelector(".pogoda");
const arrowLeft = document.querySelector(".arrow-left");
const arrowRight = document.querySelector(".arrow-right");
const horizontal = document.querySelector(".horizontal-scroll-wrapper");
const errorContent = document.querySelector("[data-error-content]");
const error = document.querySelector("main");
const content = document.getElementById("content");
const loader = document.getElementById("loader");


const API_KEY = "abdc6aa984d531707faba27e8b0a44e1"; // API key for OpenWeatherMap API


window.addEventListener('load', () => {
    const cityName = localStorage.getItem('storedValue');

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        const {lat, lon, name} = data[0];
        getWeatherDetails(name, lat, lon);
    })
})

arrowLeft.addEventListener("click", function () {
    sideScroll(horizontal, 'left', 1, 500, 1000);
});

arrowRight.addEventListener("click", function () {
    sideScroll(horizontal, 'right', 1, 500, 1000);
});


function sideScroll(element, direction, speed, distance, step) {

    let scrollAmount = 0;
    var slideTimer = setInterval(function () {
        if (direction == 'left') {
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }
        scrollAmount += step;
        if (scrollAmount >= distance) {
            window.clearInterval(slideTimer);
        }
    }, speed);
}


const createWeatherCard = (cityName, weatherItem, index) => {
    const test = String(weatherItem.weather[0].description);
    const t = test[0].toUpperCase();
    const description = t + test.substring(1, test.length);

    function opad_at() {
        let atm;

        if (weatherItem.rain == undefined && weatherItem.snow == undefined) {
            return "Brak inf.";
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
                    <h3 class="card-title">${description}</h3>
                    <a class="separator4"> </a>
                    <h6 class="te">Temperatura: ${(weatherItem.main.temp).toFixed(1)}°</h6>
                    <h6 class="te">Tem. Odcz: ${weatherItem.main.feels_like}°c</h6>
                    <h6 class="te">Ciśnienie: ${weatherItem.main.pressure}hPa</h6>
                    <h6 class="te">Wilgotność: ${weatherItem.main.humidity}%</h6>
                    <h6 class="te">Prd. wiatru: ${weatherItem.wind.speed}M/S</h6>
                    <h6 class="te">Opad atmos.: ${opad_at()}</h6>
                </div>`;

}

const createname = (cityName) => {
    return `Pogoda na najbliższe dni w ${cityName}:`;
}
const getWeatherDetails = (cityName, latitude, longitude) => {
    loader.style.display = "none";

    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pl&units=metric`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            return uniqueForecastDays.push(forecastDate);
        });


        // Clearing previous weather data
        locationDis.innerHTML = "";
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            const html1 = createname(cityName, weatherItem, index);
            if (index == 0) {
                locationDis.insertAdjacentHTML("beforeend", html1);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        error.style.display = "none";
        errorContent.style.display = "flex";
        console.log("Wystąpił błąd podczas pobierania prognozy pogody!");
    });

    setTimeout(() => {
        loader.style.display = "none";
        content.style.display = "block";
    }, 200);

}

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
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

function saveLoc(inputValue) {
    localStorage.setItem('storedValue', inputValue);
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());



