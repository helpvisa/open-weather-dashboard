/** query selectors on page **/
var currentEl = $("#current-day-display");
var futureEl = $("#future-forecast-display");


/** main body of code **/
fetchWeather("Germany");


/** function delcarations **/
// fetch from open weather api
function fetchWeather(city) {
    city = city.toLowerCase(); // set string to lowercase for easier comparison
    // check city call; use this to grab lat+lon for onecall (and 7 day forecast)
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" +
        city + "&exclude=minutely,hourly&appid=00d7613313737e94ece2f321eed9e569";

    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(coord) {
                var onecallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                    coord.coord.lat + "&lon=" + coord.coord.lon +
                    "&exclude=minutely,hourly&appid=00d7613313737e94ece2f321eed9e569"
                fetch(onecallUrl).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            console.log(data);
                            displayWeather(data);
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
    cardHeaderEl.text(weather.timezone.split("/")[1]);
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