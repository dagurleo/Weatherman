let tempType = 'c'; // Temptype -- TODO: store in cookie?
let data = []; // Temperatures --TODO: rename
let dates = []; // TODO: rename
let defaultStation = '1'; //Tename
let chart; //Rename
let compareMode = false;
let defaultLanguage = 'is';
window.onload = function(){
    getStations();
    addEventListeners();
    getForecastsByStation(defaultStation, 'chartContainer', 'en'); // Fill the first component
    getTextNews(); // Fill the second component
    getLatestObservation(); // Fill the third component

}

function getStations(){
    for(var i in stations){
        let selected = (stations[i].id === defaultStation ? 'selected' : '');
        let html = `<option value="${stations[i].id}" ${selected}>${stations[i].name}</option>`;
        $('.weatherStation').append(html);
    }
    $('.weatherStation').select2();
}

function addEventListeners(){
    $('.weatherStation').change((e) => {
        // station = e.target.value;
        if(!compareMode) {
            resetChart(e.target.value);
        } else {
            for(var i in data){
                if(e.target.value === data[i].id){
                    let selectLabel = $('.selectLabel');
                    let oldText = selectLabel.text();
                    selectLabel.text(data[i].name + ' is already on the graph.').css('color', 'red').css('font-size', '0.7em');
                    setTimeout(() => {
                        selectLabel.text(oldText).css('color', '#333').css('font-size', '0.9m');
                    }, 3000);
                    return;
                }
            }
            getForecastsByStation(e.target.value, 'chartContainer');
        }
    });

    $('#compareModeButton').click(function(e) {
        if(!compareMode){
            $(this).removeClass('btn-primary')
                .addClass('btn-danger').text('Disable compare mode');
            $('.selectLabel').text('Select multiple stations');
        } else {
            $(this).removeClass('btn-danger')
                .addClass('btn-primary').text('Enable compare mode');
                $('.selectLabel').text('Select a station');
            if(data.length > 1){
                data = [data[0]];
                chart.destroy();
                drawChart('chartContainer', data[0].name, dates, data);
                $('.weatherStation').val(data[0].id).trigger('change.select2'); //Resets the default selected value in the select2 menu.
            }

        }
        compareMode = !compareMode;
    });

    $('.degreeChanger').click(function(e){
        if($(this).hasClass('disabledDegreeType')){
            if(e.target.id === 'celcius'){
                tempType = 'c';
                $('#fahrenheit').addClass('disabledDegreeType');
            } else {
                tempType = 'f';
                $('#celcius').addClass('disabledDegreeType');
            }
            switchTempType();
            drawChart('chartContainer', data[0].name, dates, data);
            $(this).removeClass('disabledDegreeType');
        }
    });
}
//Fetch the forecast for the next 9 days
function getForecastsByStation(station, element){
    $.ajax({
        'url': 'http://apis.is/weather/forecasts/' + defaultLanguage,
        'type':'GET',
        'dataType': 'json',
        'data': {'stations': station},
        'success': function(res){
            calculateForecastData(res.results[0], element);
            $('.chartLoader').css('display', 'none');
            $('.chartToolbar').css('display', 'block')
        },
        'error': function(err){
            let html = `
                <div class="errorMessage" style="color: red">
                    There was an error fetching the data from apis.is, please try again in af few seconds.
                </div>
            `;
            $('.chartLoader').css('display', 'none');
            $('.chartCont').append(html);
        }
    });
}
function calculateForecastData(forecasts, element){

    const temps = [];
    lastDate = forecasts.forecast[0].ftime.split(' ')[0], avgTemps = [];
    for(var i in forecasts.forecast){
        if(lastDate === forecasts.forecast[i].ftime.split(' ')[0]) {
            avgTemps.push(Number(forecasts.forecast[i].T));
        } else {
            let avg = avgTemps.reduce((total, num) => {
                return total + num;
            });
            avg /= avgTemps.length;
            if(tempType === 'f'){
                avg = (((avg * 9) / 5) + 32);
            }
            temps.push(Number(avg.toFixed(2)));
            dates.push(formatDateTime(lastDate));
            avgTemp = [];
        }
        lastDate = forecasts.forecast[i].ftime.split(' ')[0];
    }
    data.push({
        name: forecasts.name,
        data: temps,
        id: forecasts.id,
        color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)

    });
    drawChart(element, forecasts.name, dates, data);
}

function drawChart(element, name, dates, data){
    chart = new Highcharts.chart(element, {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Average Temperatures'
    },
    subtitle: {
        text: dates[0] + ' - ' + dates[dates.length - 1]
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
    series: data
    });
}

function switchTempType(){
    if(tempType === 'f'){
        for(var i in data){
            let temps = data[i].data;
            for(var i in temps){
                temps[i] = Number((((temps[i] * 9) / 5) + 32).toFixed(2));
            }
        }
    } else {
        for(var i in data){
            let temps = data[i].data;
            for(var i in temps){
                temps[i] = Number(((temps[i] - 32) * 5 / 9).toFixed(2));
            }
        }
    }
}

function resetChart(newStation){
    data = [];
    dates = [];
    chart.destroy();
    getForecastsByStation(newStation, 'chartContainer', 'en');
}

function getTextNews(){
    $.ajax({
        'url': 'http://apis.is/weather/texts',
        'dataType': 'json',
        'data': {'types': '2,3,5,6,'},
        'success': function(res){
            let sortedResults = res.results.sort((a, b) => {
                return (a.creation > b.creation ? -1 : 1);
            });
            $('.textLoader').css('display', 'none');
            for(var i in sortedResults){
                let html = `
                <div class="col-sm-12 textBox">
                    <h2>${res.results[i].title} <span class="titleDate">${formatDateTime(res.results[i].creation)}</span></h2>
                    <p>${res.results[i].content}</p>
                </div>
                `;
                $('.textContainer').append(html);
            }

        },
        'error': function(err){
            let html = `
                <div class="errorMessage" style="color: red">
                    There was an error fetching the data from apis.is, please try again in af few seconds.
                </div>
            `;
            $('.textLoader').css('display', 'none');
            $('.textContainer').append(html);
        }
    });

}


function getLatestObservation(){
    $.ajax({
        'url': 'http://apis.is/weather/observations/' + defaultLanguage,
        'type': 'GET',
        'dataType': 'json',
        'data': {'stations': defaultStation, 'time': '1h', 'anytime': '1'},
        'success': function(res) {
            drawObservations(res.results[0]);
        },
        'error': function(err){
            let html = `
                <div class="errorMessage" style="color: red">
                    There was an error fetching the data from apis.is, please try again in af few seconds.
                </div>
            `;
            $('.todayLoader').css('display', 'none');
            $('.observationsContainer').append(html);
        }
    });
}

function drawObservations(obv){
    let html = `
    <div class="row">
        <div class="col-md-12" style="text-align: center;">
            <h1>Latest observations for ${obv.name}</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6" style="margin-top: -30px;">
            <p style="font-style: italic; margin-top: 33px; padding-left: 20px;">${formatDateTime(obv.time)}</p>
        </div>
    </div>
    <div class="row obvRow">
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-thermometer-full" aria-hidden="true"></i>
            <p>${(obv.T ? obv.T : '-')}°C</p>
        </div>
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-flag-o" aria-hidden="true"></i>
            <p>${(obv.F ? obv.F : '-')}m/s</p>
        </div>
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
            <p>${(obv.D ? obv.D : '-')}</p>
        </div>
    </div>
    <div class="row obvRow">
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-space-shuttle" aria-hidden="true"></i>
            <p>${(obv.P ? obv.P : '-')}hPa</p>
        </div>
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-percent" aria-hidden="true"></i>
            <p>${(obv.RH ? obv.RH : '-')}%</p>
        </div>
        <div class="col-md-4 col-xs-4 singleObv">
            <i class="fa fa-tint" aria-hidden="true"></i>
            <p>${(obv.R ? obv.R : '-')}mm/h</p>
        </div>
    </div>
    `;
    $('.todayLoader').css('display', 'none');
    $('.observationsContainer').append(html);
}

//Accepts formats (YYYY-MM-DD hh:mm:ss) and (YYYY-MM-DD)
function formatDateTime(dateTime){
    dateTime = dateTime.split(' ');
    let date = dateTime[0].split('-');
    date = date[2] + '-'+date[1] + '-' + date[0];
    return (dateTime[1] ? date + ' ' + dateTime[1] : date);
}
