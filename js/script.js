
const cityName = document.getElementById('cityInput');
const fetchCity = document.getElementById('searchCity')
const API_KEY = '9b9334eca16d1174ec08648cb5233bfc';

function showLoading() {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('forecast-info').style.display = 'none'; // adjust to your class
  document.getElementById('todayForecast').style.display = 'none';
  document.getElementById('forEachDay').style.display = 'none';
  document.getElementById('forecastLocation').style.display = 'none';
}

function showContent() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('forecast-info').style.display = 'block'; // adjust to your class
  document.getElementById('todayForecast').style.display = 'block';
  document.getElementById('forEachDay').style.display = 'block';
  document.getElementById('forecastLocation').style.display = 'flex';
}

function showEmpty() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';
  document.getElementById('forecast-info').style.display = 'none';
  document.getElementById('todayForecast').style.display = 'none';
  document.getElementById('forEachDay').style.display = 'none';
  document.getElementById('forecastLocation').style.display = 'none';
}

showEmpty();

async function fetchCityData() {
  const city = cityName.value.trim();
  if (!city) return;

  showLoading(); // ← show spinner immediately

  try {
    const [forecast, weather] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`),

      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    ])



    if (!forecast.ok || !weather.ok) {
      throw new Error('City not found.')
    }

    const forecastData = await forecast.json();
    const weatherData = await weather.json();


    console.log(forecastData);
    console.log(weatherData);



    const icon = weatherData.weather[0].icon;

    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;




    document.getElementById('location').textContent = `${forecastData.city.name}`;
    document.getElementById('country').textContent = `${weatherData.sys.country}`;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('temp').textContent = `${Math.round(weatherData.main.temp)}°C`;
    document.getElementById('description').textContent = `${weatherData.weather[0].description}~`;
    document.getElementById('feelsLike').textContent = `${Math.round(weatherData.main.feels_like)}°`;
    document.getElementById('speed').textContent = `${weatherData.wind.speed}m/s`;
    document.getElementById('humidity').textContent = `${weatherData.main.humidity}%`;
    document.getElementById('wind').textContent = `${weatherData.wind.gust ?? 'N/A'}m/s`;

    const sortForecastData = (forecastData) => {

      const firstDay = forecastData.list.slice(0, 8)

      const secondDay = forecastData.list.slice(8, 16)

      const thirdDay = forecastData.list.slice(16, 24)

      const fourthDay = forecastData.list.slice(24, 32)

      const fifthDay = forecastData.list.slice(32, 40)

      return { firstDay, secondDay, thirdDay, fourthDay, fifthDay };
    }

    const currentDay = sortForecastData(forecastData).firstDay;

    let html = '<h3>Today\'s Forecast</h3><div class="card-div">';

    currentDay.forEach(item => {

      const newTime = new Date(item.dt_txt);
      const time = newTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const hourIcon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

      html += `
        <div class="hour-card">
           <p>${time}</p>
          <div>
           <h6>${Math.round(item.main.temp)}°</h6>
           <img src="${hourIcon}" alt="weather icon">
          </div>
        </div>
    `;
    });

    document.getElementById('todayForecast').innerHTML = html;

    //  5-day forecast

    const eachDay = sortForecastData(forecastData);

    console.log(eachDay);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    let forEachDay = `
        <div class="daily-text">
          <div><h1>Daily Forecast</h1></div>
          <div><h3>${forecastData.city.name}</h3></div>       
        </div>
        <div class="day-cont">
    `;

    Object.values(eachDay).forEach((daySlice, index) => {

      const rep = daySlice[4] || daySlice[0];
      const dayIcon = `https://openweathermap.org/img/wn/${rep.weather[0].icon}@2x.png`;
      const dayDate = new Date(rep.dt_txt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const rainChance = Math.round((rep.pop ?? 0) * 100);
      const dayTemp = Math.round(rep.main.temp);

      let hoursHTML = '';
      daySlice.forEach(item => {

        const t = new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', hour12: false });
        const hIcon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        const hRain = Math.round((item.pop ?? 0) * 100);

        hoursHTML += `
            <div class="hour-info">
              <p>${t}</p>
              <img src="${hIcon}" alt="weather icon">
              <h5>${Math.round(item.main.temp)}°</h5>
              <p>${hRain}%</p>
            </div>
        `;
      });

      forEachDay += `
          <div class="day-card">
            <div class="day-div">
              <div class="div1">
                <img src="${dayIcon}" alt="weather icon">
                <div>
                  <h3>${dayNames[index] ?? 'Day ' + (index + 1)}</h3>
                <p>${dayDate}</p>
                </div>
              </div>
              <div class="div2">
                <p>${rainChance}%</p>
                <h2>${dayTemp}°</h2>
              </div>
            </div>
            <hr>
            <div class="daily-hour">
              ${hoursHTML}
            </div>
          </div>
      `;
    });

    forEachDay += '</div>';

    document.getElementById('forEachDay').innerHTML = forEachDay;

    
    showContent(); // ← hide spinner, reveal weather


  } catch (error) {
    console.error('Error:', error.message);
    showEmpty(); // ← if it fails, go back to empty state
  }
}



fetchCity.addEventListener('click', fetchCityData);