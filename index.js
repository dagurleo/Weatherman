let tempType = 'c';
let data = [];
let dates = [];

window.onload = function() {
    getForecasts('en'); // The first component
    getTextNews(); // The second component
}

//Fetch the forecast for the next 9 days
function getForecasts(language){
    $.ajax({
        'url': 'http://apis.is/weather/forecasts/' + language,
        'type':'GET',
        'dataType': 'json',
        'data': {'stations': '1,31579,499'},
        'success': function(res){
            calculateForecastData(res.results[0], 'c');
        }
    });
}
function calculateForecastData(forecasts){
    lastDate = forecasts.forecast[0].ftime.split(' ')[0], avgTemps = [];
    for(var i in forecasts.forecast){
        if(lastDate === forecasts.forecast[i].ftime.split(' ')[0]) {
            avgTemps.push(Number(forecasts.forecast[i].T));
        } else {
            let avg = avgTemps.reduce((total, num) => {
                return total + num;
            });
            avg /= avgTemps.length;
            data.push(Number(avg.toFixed(2)));
            dates.push(formatDateTime(lastDate));
            avgTemp = [];
        }
        lastDate = forecasts.forecast[i].ftime.split(' ')[0];
    }
    drawChart(dates, data);
}

function drawChart(dates, data) {
    Highcharts.chart('chartContainer', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Average Temperatures from ' + dates[0] + ' until ' + dates[dates.length - 1]
    },
    subtitle: {
        text: 'Station: Reykjavík'
    },
    xAxis: {
        categories: dates
    },
    yAxis: {
        title: {
            text: 'Temperature ' + (tempType ==='c' ? '(°C)' : tempType === 'f' ? '(°F)' : '(°C)')
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'RVK',
        data: data
    }]
    });
}

function getTextNews(){
    $.ajax({
        'url': 'http://apis.is/weather/texts',
        'dataType': 'json',
        'data': {'types': '2,3,5,6,7'},
        'success': function(res){
            console.log(res.results);
            for(var i in res.results){

                let html = `
                <div class="col-sm-12 textBox">
                    <h2>${res.results[i].title} <span class="titleDate">${formatDateTime(res.results[i].creation)}</span></h2>
                    <p>${res.results[i].content}</p>
                </div>
                `;
            $('.textContainer').append(html);
            }
        }
    });

}


//Accepts formats (YYYY-MM-DD hh:mm:ss) and (YYYY-MM-DD)
function formatDateTime(dateTime){
    dateTime = dateTime.split(' ');
    let date = dateTime[0].split('-');
    date = date[2] + '-'+date[1] + '-' + date[0];
    return (dateTime[1] ? date + ' ' + dateTime[1] : date);
}






// $.ajax({
//     'url': 'http://apis.is/weather/observations/en',
//     'dataType': 'json',
//     'data': {'stations': '1'},
//     'success': function(res){
//         console.log(res.results);
//     }
// });
