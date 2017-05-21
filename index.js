let tempType = 'c'; // Temptype -- TODO: store in cookie?
let data = []; // Temperatures --TODO: rename
let dates = []; // TODO: rename
// let station = '422'; //Tename
let chart; //Rename
let compareMode = true;
window.onload = function(){
    getStations();
    addEventListeners();
    getForecastsByStation('422', 'chartContainer', 'en'); // Fill the first component
    getTextNews(); // Fill the second component

}

function getStations(){
    for(var i in stations){
        let html = `<option value="${stations[i].id}">${stations[i].name}</option>`;
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
            getForecastsByStation(e.target.value, 'chartContainer', 'en');
        }

    });

    $('.startCompare').click((e) => {

    });

}
//Fetch the forecast for the next 9 days
function getForecastsByStation(station, element, language){
    $.ajax({
        'url': 'http://apis.is/weather/forecasts/' + language,
        'type':'GET',
        'dataType': 'json',
        'data': {'stations': station},
        'success': function(res){
            calculateForecastData(res.results[0], element);
        }
    });
}
function calculateForecastData(forecasts, element){
    console.log(forecasts);
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
            temps.push(Number(avg.toFixed(2)));
            dates.push(formatDateTime(lastDate));
            avgTemp = [];
        }
        lastDate = forecasts.forecast[i].ftime.split(' ')[0];
    }
    data.push({
        name: forecasts.name,
        data: temps,
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
        'data': {'types': '2,3,5,6,7'},
        'success': function(res){
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
