/** global variable declarations **/
var maxHistory = 6; // maximum # of cities allowed to appear in the search history
var prevHist = []; // array of previously searched arrays


/** query selectors on page **/
var currentEl = $("#current-day-display");
var futureEl = $("#future-forecast-display");
var formEl = $("#city-form");
var formTextEl = $("#city-name");
var inputHistoryEl = $("#city-history");


/** main body of code **/
// add listeners
formEl.on("submit", formSubmissionHandler);
inputHistoryEl.on("click", ".btn", function(event) {
    var city = $(this).text();
    fetchWeather(city);
})


/** function delcarations **/
// handle city entry
function formSubmissionHandler(event) {
    event.preventDefault();

    // get value
    var city = formTextEl.val().trim();
    formTextEl.val(""); // reset text field

    fetchWeather(city);
}

// update clickable history display
function updateHistory(city) {
    // add this city to the search history, if it isn't already there...
    var alreadyInHistory = false;
    for (var i = 0; i < prevHist.length; i++) {
        if (prevHist[i] == city) {
            alreadyInHistory = true;
            break;
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

        // clear history display
        inputHistoryEl.text("");
        // now re-create it from the local array
        for (var i = prevHist.length - 1; i > -1; i--) {
            var histEl = $("<div>");
            histEl.addClass("btn btn-secondary my-auto mx-2");
            histEl.text(prevHist[i]);
            inputHistoryEl.append(histEl);
        }
    }
}

// fetch from open weather api
function fetchWeather(city) {
    city = city.toLowerCase(); // set string to lowercase for easier comparison
    // check city call; use this to grab lat+lon for onecall (and 7 day forecast)
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" +
        city + "&exclude=minutely,hourly&appid=00d7613313737e94ece2f321eed9e569";

    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(coord) { // use weather query to fetch lat+lon coords for onecall query
                var onecallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                    coord.coord.lat + "&lon=" + coord.coord.lon +
                    "&exclude=minutely,hourly&appid=00d7613313737e94ece2f321eed9e569"
                fetch(onecallUrl).then(function(response) { // nest additional api call
                    if (response.ok) {
                        response.json().then(function(data) {
                            displayWeather(data);
                            updateHistory(city);
                        });
                    } else {
                        alert("No weather data found.");
                    }
                })
                .catch(function(error) {
                    // catch network errors
                    alert(error + " // Could not connect to Open Weather Map API.");
                });
            });
        } else {
            alert("No weather data found.");
        }
    })
    .catch(function(error) {
        // catch network errors
        alert(error + " // Could not connect to Open Weather Map API.");
    });
}

// build cards with weather data
function displayWeather(weather) {
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
    var cityNameDisplay = weather.timezone.split("/")[1]
    cityNameDisplay = cityNameDisplay.replaceAll("_", " ");
    cardHeaderEl.text(cityNameDisplay);
    cardEl.append(cardHeaderEl);
    // card body
    var cardBodyEl = $("<div>");
    cardBodyEl.addClass("card-body");
    cardEl.append(cardBodyEl);
    // 4 main body texts
    for (var i = 0; i < 4; i++) {
        var pEl = $("<p>");
        pEl.addClass("card-text");

        if (i === 0) { // temp
            pEl.text("Temperature: " + current.temp);
        } else if (i === 1) { // wind
            pEl.text("Wind: " + current.wind_speed);
        } else if (i === 2) { // humidity
            pEl.text("Humidity: " + current.humidity + "%");
        } else if (i === 3) { // uv
            pEl.text("UV Index: " + current.uvi);
        }
        cardBodyEl.append(pEl)
    }
    // append to container
    currentEl.append(containerEl);

    // build out future forecasts
    for (var c = 0; c < 5; c++) { // c for card; build 5!
        // card container
        var containerEl = $("<div>");
        containerEl.addClass("col-sm-12 col-lg-2");
        // actual card
        var cardEl = $("<div>");
        cardEl.addClass("card bg-info");
        containerEl.append(cardEl);
        // card header
        var cardHeaderEl = $("<h5>");
        cardHeaderEl.addClass("card-header");
        cardHeaderEl.text("Day " + (c + 1));
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
                pEl.text("Temp: " + future[c].temp.day);
            } else if (i === 1) { // wind
                pEl.text("Wind: " + future[c].wind_speed);
            } else if (i === 2) { // humidity
                pEl.text("Humidity: " + future[c].humidity + "%");
            }
            cardBodyEl.append(pEl)
        }
        // append to container
        futureEl.append(containerEl);
    }
}