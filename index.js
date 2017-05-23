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


let stations = [
  {
    "name": "Akureyri ",
    "id": "422"
  },
  {
    "name": "Árnes ",
    "id": "6420"
  },
  {
    "name": "Ásbyrgi ",
    "id": "4614"
  },
  {
    "name": "Ásgarður ",
    "id": "2175"
  },
  {
    "name": "Bergstaðir ",
    "id": "361"
  },
  {
    "name": "Bíldudalur ",
    "id": "2428"
  },
  {
    "name": "Bjargtangar ",
    "id": "2304"
  },
  {
    "name": "Bjarnarey ",
    "id": "4472"
  },
  {
    "name": "Bláfjöll ",
    "id": "1486"
  },
  {
    "name": "Blönduós ",
    "id": "3317"
  },
  {
    "name": "Blönduós Vegagerðarstöð ",
    "id": "33419"
  },
  {
    "name": "Bolungarvík ",
    "id": "252"
  },
  {
    "name": "Brattabrekka ",
    "id": "31985"
  },
  {
    "name": "Breiðdalsheiði ",
    "id": "35965"
  },
  {
    "name": "Brú á Jökuldal ",
    "id": "5940"
  },
  {
    "name": "Búrfell ",
    "id": "6430"
  },
  {
    "name": "Egilsstaðaflugvöllur ",
    "id": "571"
  },
  {
    "name": "Ennisháls ",
    "id": "32390"
  },
  {
    "name": "Eskifjörður ",
    "id": "5981"
  },
  {
    "name": "Eyjabakkar ",
    "id": "5943"
  },
  {
    "name": "Eyrarbakki ",
    "id": "1395"
  },
  {
    "name": "Fagridalur ",
    "id": "34073"
  },
  {
    "name": "Fjarðarheiði ",
    "id": "34175"
  },
  {
    "name": "Flateyri ",
    "id": "2631"
  },
  {
    "name": "Fróðárheiði ",
    "id": "31931"
  },
  {
    "name": "Gagnheiði ",
    "id": "4275"
  },
  {
    "name": "Garðskagaviti ",
    "id": "1453"
  },
  {
    "name": "Gjögurflugvöllur ",
    "id": "2692"
  },
  {
    "name": "Grindavík ",
    "id": "1361"
  },
  {
    "name": "Grímsey ",
    "id": "3976"
  },
  {
    "name": "Grímsstaðir á Fjöllum ",
    "id": "4323"
  },
  {
    "name": "Gufuskálar ",
    "id": "1919"
  },
  {
    "name": "Gullfoss ",
    "id": "36519"
  },
  {
    "name": "Hafnarfjall ",
    "id": "31674"
  },
  {
    "name": "Hallormsstaður ",
    "id": "4060"
  },
  {
    "name": "Hágöngur ",
    "id": "6776"
  },
  {
    "name": "Hálfdán ",
    "id": "32322"
  },
  {
    "name": "Hálsar ",
    "id": "34733"
  },
  {
    "name": "Hellisheiði ",
    "id": "31392"
  },
  {
    "name": "Hellisskarð ",
    "id": "1490"
  },
  {
    "name": "Holtavörðuheiði ",
    "id": "32097"
  },
  {
    "name": "Hornbjargsviti ",
    "id": "2862"
  },
  {
    "name": "Hólasandur ",
    "id": "33495"
  },
  {
    "name": "Hólmavík ",
    "id": "2481"
  },
  {
    "name": "Hraunsmúli ",
    "id": "31840"
  },
  {
    "name": "Húsafell ",
    "id": "6802"
  },
  {
    "name": "Húsavík ",
    "id": "3696"
  },
  {
    "name": "Hvalnes ",
    "id": "35666"
  },
  {
    "name": "Hvammur ",
    "id": "36127"
  },
  {
    "name": "Hvanneyri ",
    "id": "1779"
  },
  {
    "name": "Hveravellir ",
    "id": "6935"
  },
  {
    "name": "Höfn í Hornafirði ",
    "id": "705"
  },
  {
    "name": "Ingólfshöfði ",
    "id": "5210"
  },
  {
    "name": "Ísafjörður ",
    "id": "2642"
  },
  {
    "name": "Jökulheimar ",
    "id": "6670"
  },
  {
    "name": "Kálfhóll ",
    "id": "6310"
  },
  {
    "name": "Kárahnjúkar ",
    "id": "5933"
  },
  {
    "name": "Keflavíkurflugvöllur ",
    "id": "990"
  },
  {
    "name": "Kirkjubæjarklaustur ",
    "id": "6272"
  },
  {
    "name": "Kjalarnes ",
    "id": "31579"
  },
  {
    "name": "Kleifaheiði ",
    "id": "32224"
  },
  {
    "name": "Klettsháls ",
    "id": "32355"
  },
  {
    "name": "Kolka ",
    "id": "3225"
  },
  {
    "name": "Kollaleira ",
    "id": "5975"
  },
  {
    "name": "Kvísker Vegagerðarstöð ",
    "id": "35315"
  },
  {
    "name": "Lambavatn ",
    "id": "2315"
  },
  {
    "name": "Laufbali ",
    "id": "6472"
  },
  {
    "name": "Laxárdalsheiði ",
    "id": "32190"
  },
  {
    "name": "Lómagnúpur ",
    "id": "36386"
  },
  {
    "name": "Lónakvísl ",
    "id": "6459"
  },
  {
    "name": "Mánárbakki ",
    "id": "3797"
  },
  {
    "name": "Mýrdalssandur ",
    "id": "36156"
  },
  {
    "name": "Mývatn ",
    "id": "4300"
  },
  {
    "name": "Mývatnsheiði ",
    "id": "33394"
  },
  {
    "name": "Mývatnsöræfi ",
    "id": "34413"
  },
  {
    "name": "Möðrudalsöræfi II ",
    "id": "34238"
  },
  {
    "name": "Nautabú ",
    "id": "3242"
  },
  {
    "name": "Neskaupstaður ",
    "id": "5990"
  },
  {
    "name": "Oddsskarð ",
    "id": "34087"
  },
  {
    "name": "Ólafsfjörður ",
    "id": "3658"
  },
  {
    "name": "Papey ",
    "id": "5777"
  },
  {
    "name": "Patreksfjörður ",
    "id": "2319"
  },
  {
    "name": "Rauðhálsar ",
    "id": "3596"
  },
  {
    "name": "Raufarhöfn ",
    "id": "4828"
  },
  {
    "name": "Reykir í Fnjóskadal ",
    "id": "3380"
  },
  {
    "name": "Reykir í Hrútafirði ",
    "id": "2197"
  },
  {
    "name": "Reykjanesbraut ",
    "id": "31363"
  },
  {
    "name": "Reykjavík ",
    "id": "1"
  },
  {
    "name": "Sandbúðir ",
    "id": "6975"
  },
  {
    "name": "Sandvíkurheiði ",
    "id": "34559"
  },
  {
    "name": "Sámsstaðir ",
    "id": "6222"
  },
  {
    "name": "Sáta ",
    "id": "3054"
  },
  {
    "name": "Selvogur ",
    "id": "31380"
  },
  {
    "name": "Setur ",
    "id": "6748"
  },
  {
    "name": "Seyðisfjörður ",
    "id": "4182"
  },
  {
    "name": "Siglufjarðarvegur ",
    "id": "33750"
  },
  {
    "name": "Siglufjörður ",
    "id": "3752"
  },
  {
    "name": "Siglunes ",
    "id": "3754"
  },
  {
    "name": "Skaftafell ",
    "id": "6499"
  },
  {
    "name": "Skagatá ",
    "id": "3720"
  },
  {
    "name": "Skarðsfjöruviti ",
    "id": "6176"
  },
  {
    "name": "Skálholt ",
    "id": "36411"
  },
  {
    "name": "Skjaldþingsstaðir ",
    "id": "527"
  },
  {
    "name": "Steinar ",
    "id": "36132"
  },
  {
    "name": "Steingrímsfjarðarheiði ",
    "id": "32474"
  },
  {
    "name": "Stórhöfði ",
    "id": "6017"
  },
  {
    "name": "Stykkishólmur ",
    "id": "178"
  },
  {
    "name": "Súðavík ",
    "id": "2646"
  },
  {
    "name": "Svínadalur í Dölum ",
    "id": "32179"
  },
  {
    "name": "Tjörnes ",
    "id": "34700"
  },
  {
    "name": "Vatnaleið ",
    "id": "31948"
  },
  {
    "name": "Vatnsfell ",
    "id": "6546"
  },
  {
    "name": "Vatnsskarð ",
    "id": "33431"
  },
  {
    "name": "Vatnsskarð eystra ",
    "id": "34382"
  },
  {
    "name": "Veiðivatnahraun ",
    "id": "6657"
  },
  {
    "name": "Vestmannaeyjabær ",
    "id": "6015"
  },
  {
    "name": "Víkurskarð ",
    "id": "33576"
  },
  {
    "name": "Þingvellir ",
    "id": "1596"
  },
  {
    "name": "Þjórsárbrú ",
    "id": "36308"
  },
  {
    "name": "Þrengsli ",
    "id": "31387"
  },
  {
    "name": "Þúfuver ",
    "id": "6760"
  },
  {
    "name": "Þverárfjall ",
    "id": "33424"
  },
  {
    "name": "Þverfjall ",
    "id": "2636"
  },
  {
    "name": "Þykkvibær ",
    "id": "6208"
  },
  {
    "name": "Æðey ",
    "id": "2655"
  },
  {
    "name": "Ögur ",
    "id": "32654"
  },
  {
    "name": "Öxnadalsheiði ",
    "id": "33357"
  }
];
