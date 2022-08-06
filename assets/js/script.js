/** global variable declarations **/
var maxHistory = 12; // maximum # of cities allowed to appear in the search history
var units = "metric"; // metric or imperial?
var prevHist = null; // establish search history (null to begin, before load)


/** query selectors on page **/
var currentEl = $("#current-day-display");
var futureEl = $("#future-forecast-display");
var formEl = $("#city-form");
var formTextEl = $("#city-name");
var inputHistoryEl = $("#city-history");
var unitEl = $("#units");


/** main body of code **/
// add listeners
formEl.on("submit", formSubmissionHandler);
inputHistoryEl.on("click", ".btn", function(event) {
    var city = $(this).text();
    city = city.replaceAll(" ", "+"); // replace spaces with space code character

    // clear elements
    currentEl.text("");
    futureEl.text("");

    var loadEl = loadCard();
    currentEl.append(loadEl);

    fetchWeather(city);
})

// change units
unitEl.on("click", function() {
    if (units === "metric") {
        units = "imperial"
    } else {
        units = "metric"
    }

    unitEl.text(units);

    // get the name of the currently displayed city; if there is one, do a search
    var fetchString = $("#main-card").text().split("-")[1];
    fetchString = fetchString.replaceAll(" ", "+"); // replace spaces with space code character
    if (fetchString) {
        // clear elements
        currentEl.text("");
        futureEl.text("");

        var loadEl = loadCard();
        currentEl.append(loadEl);

        fetchWeather(fetchString);
    }
});

// load history
prevHist = JSON.parse(localStorage.getItem("history"));
if (!prevHist) {
    prevHist = []; // array of previously searched arrays
}
updateHistory(null);


/** function delcarations **/
// handle city entry
function formSubmissionHandler(event) {
    event.preventDefault();

    // get value
    var city = formTextEl.val().trim();
    city = city.replaceAll(" ", "+"); // replace spaces with space code character
    console.log(city);
    formTextEl.val(""); // reset text field

    // clear elements
    currentEl.text("");
    futureEl.text("");

    var loadEl = loadCard();
    currentEl.append(loadEl);

    fetchWeather(city);
}

// update clickable history display
function updateHistory(city) {
    // add this city to the search history, if it isn't already there...
    var alreadyInHistory = false;

    if (city === null) { // no city presented to function
        alreadyInHistory = true; // so skip the for loop and go straight to updating the display
    }
    else {
        for (var i = 0; i < prevHist.length; i++) {
            if (prevHist[i] == city) {
                alreadyInHistory = true;
                break;
            }
        }
    }

    if (!alreadyInHistory) {
        prevHist.push(city);

        // now shift off old searches if there are too many (oldest at beginning of array)
        if (prevHist.length > maxHistory) {
            var amountToPop = prevHist.length - maxHistory;
            for (var i = 0; i < amountToPop; i++) {
                prevHist.shift();
            }
        }

        // save this in localStorage
        localStorage.setItem("history", JSON.stringify(prevHist));
    }

    // clear history display
    inputHistoryEl.text("");
    // now re-create it from the local array
    for (var i = prevHist.length - 1; i > -1; i--) {
        var histEl = $("<div>");
        histEl.addClass("btn btn-secondary mx-1 mb-2");
        histEl.text(prevHist[i]);
        inputHistoryEl.append(histEl);
    }
}

// fetch from open weather api
function fetchWeather(city) {
    city = city.toLowerCase(); // set string to lowercase for easier comparison
    // check city call; use this to grab lat+lon for onecall (and 7 day forecast)
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" +
        city + "&appid=00d7613313737e94ece2f321eed9e569";

    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(coord) { // use weather query to fetch lat+lon coords for onecall query
                var onecallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                    coord.coord.lat + "&lon=" + coord.coord.lon +
                    "&exclude=minutely,hourly&units=" + units + "&appid=00d7613313737e94ece2f321eed9e569"
                fetch(onecallUrl).then(function(response) { // nest additional api call
                    if (response.ok) {
                        response.json().then(function(data) {
                            var cityName = coord.name;
                            displayWeather(data, cityName);
                            updateHistory(cityName);
                        });
                    } else {
                        // clear elements
                        currentEl.text("");
                        futureEl.text("");
                        alert("No weather data found.");
                    }
                })
                .catch(function(error) {
                    // clear elements
                    currentEl.text("");
                    futureEl.text("");
                    // catch network errors
                    alert(error + " // Could not connect to Open Weather Map API.");
                });
            });
        } else {
            // clear elements
            currentEl.text("");
            futureEl.text("");
            alert("No weather data found.");
        }
    })
    .catch(function(error) {
        // clear elements
        currentEl.text("");
        futureEl.text("");
        // catch network errors
        alert(error + " // Could not connect to Open Weather Map API.");
    });
}

// build cards with weather data
function displayWeather(weather, cityName) {
    // clear elements
    currentEl.text("");
    futureEl.text("");

    var current = weather.current; // today
    var future = weather.daily; // future, returns 7 days
    
    // build out current day card
    // card container
    var containerEl = $("<div>");
    containerEl.addClass("col-12 m-4");
    // actual card
    var cardEl = $("<div>");
    cardEl.addClass("card text-center bg-warning");
    containerEl.append(cardEl);
    // card header
    var cardHeaderEl = $("<h2>");
    cardHeaderEl.addClass("card-header");
    cardHeaderEl.attr("id", "main-card");
    // current weather icon
    var weatherIconEl = appendWeatherIcon(current.weather[0].icon, "@2x");
    cardHeaderEl.append(weatherIconEl);
    // city display
    var nameEl = $("<p>");
    nameEl.text("-" + cityName + "-"); // add dashes for unit conversion text element fetch split... but it 'looks nice' so it's fine ;)
    cardHeaderEl.append(nameEl);
    // date display
    var dateEl = $("<p>");
    dateEl.text(moment().format("MM/D/YYYY"));
    cardHeaderEl.append(dateEl);
    cardEl.append(cardHeaderEl);
    // card body
    var cardBodyEl = $("<div>");
    cardBodyEl.addClass("card-body");
    cardEl.append(cardBodyEl);
    // 4 main body texts
    for (var i = 0; i < 4; i++) {
        var pEl = $("<p>");
        pEl.addClass("card-text mx-auto");

        if (i === 0) { // temp
            if (units === "metric")
                pEl.text("Temperature: " + current.temp + "°C");
            else
                pEl.text("Temperature: " + current.temp + "°F");
        } else if (i === 1) { // wind
            if (units === "metric")
                pEl.text("Wind: " + current.wind_speed + "m/s");
            else
                pEl.text("Wind: " + current.wind_speed + "mph");
        } else if (i === 2) { // humidity
            pEl.text("Humidity: " + current.humidity + "%");
        } else if (i === 3) { // uv
            pEl.text("UV: " + current.uvi);
            pEl.addClass("border border-dark rounded w-25 p-2")
            if (current.uvi < 3) {
                pEl.addClass("uv-low text-light");
            } else if (current.uvi < 6) {
                pEl.addClass("uv-moderate");
            } else if (current.uvi < 8) {
                pEl.addClass("uv-high");
            } else if (current.uvi < 11) {
                pEl.addClass("uv-veryhigh text-light");
            } else {
                pEl.addClass("uv-extreme text-light");
            }
        }
        cardBodyEl.append(pEl)
    }
    // append to container
    currentEl.append(containerEl);

    // build out future forecasts
    for (var c = 0; c < 5; c++) { // c for card; build 5!
        // card container
        var containerEl = $("<div>");
        containerEl.addClass("col-12 col-md-6 col-lg-4 col-xxl-2 mb-4");
        // actual card
        var cardEl = $("<div>");
        cardEl.addClass("card bg-info");
        containerEl.append(cardEl);
        // card header
        var cardHeaderEl = $("<h5>");
        cardHeaderEl.addClass("card-header");
        var date = moment().add(c + 1, "days");
        cardHeaderEl.text(date.format("MM/D/YYYY"));
        var weatherIconEl = appendWeatherIcon(future[c].weather[0].icon, "");
        cardHeaderEl.append(weatherIconEl);

        cardEl.append(cardHeaderEl);
        // card body
        var cardBodyEl = $("<div>");
        cardBodyEl.addClass("card-body");
        cardEl.append(cardBodyEl);
        // 3 main body texts
        for (var i = 0; i < 3; i++) {
            var pEl = $("<p>");
            pEl.addClass("card-text");

            if (i === 0) { // temp
                if (units === "metric")
                    pEl.text("Temp: " + future[c].temp.day + "°C");
                else
                    pEl.text("Temp: " + future[c].temp.day + "°F");
            } else if (i === 1) { // wind
                if (units === "metric")
                    pEl.text("Wind: " + future[c].wind_speed + "m/s");
                else
                    pEl.text("Wind: " + future[c].wind_speed + "mph");
            } else if (i === 2) { // humidity
                pEl.text("Humidity: " + future[c].humidity + "%");
            }
            cardBodyEl.append(pEl)
        }
        // append to container
        futureEl.append(containerEl);
    }
}

function appendWeatherIcon(w, size) {
    // create the icon element
    var weatherEl = $("<img>");
    // fetch from open weather map image url template
    var imgUrl = "http://openweathermap.org/img/wn/" + w + size + ".png";
    weatherEl.attr("src", imgUrl); // set img source
    weatherEl.addClass("m-auto");

    return weatherEl
}

function loadCard() {
    var containerEl = $("<div>");
    containerEl.addClass("col-12 m-auto");
    // actual card
    var cardEl = $("<div>");
    cardEl.addClass("card text-center bg-danger");
    cardEl.text("Loading weather...");
    containerEl.append(cardEl);

    return containerEl;
}