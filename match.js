var request = require("request");
var xlsx = require("xlsx");
var path = require("path");
// var url = "https://www.espncricinfo.com/series/8039/scorecard/656495/australia-vs-new-zealand-final-icc-cricket-world-cup-2014-15";
var fs = require("fs");
var cheerio = require("cheerio");

function matchHandler(url) {
    request(url, cb);
}

function cb(err, header, body) {
    if (err==null && header.statusCode==200) {
        console.log("response received");
        parseHtml(body);
    } else if (header.statusCode==404) {
        console.log("Page Not found");
    } else {
        console.log(err);
        console.log(header);
    }
}
function parseHtml(body) {
    var $ = cheerio.load(body);
    var venuElem = $(".desc.text-truncate");
    var venue = venuElem.text().trim();
    var rsElem = $(".summary span");
    var result = rsElem.text().trim();
    var bothInnings = $(".card.content-block.match-scorecard-table .Collapsible");
    // console.log(bothInnings.length);
    //console.log("``````````````````````````````")

    for (let i=0; i<bothInnings.length; i++) {
        var teamNameElem = $(bothInnings[i]).find("h5");
        var teamName = teamNameElem.text().split("Innings");
        teamName = teamName[0].trim();
        //console.log(teamName);
        var AllRows = $(bothInnings[i]).find(".table.batsman tbody tr");
        // console.log(AllRows.length);
        for (var j=0; j<AllRows.length; j++) {
            let allcols = $(AllRows[j]).find("td");
            let isPlayer = $(allcols[0]).hasClass("batsman-cell");
            if (isPlayer) {
                // player row
                let pName = $(allcols[0]).text().trim();
                let runs = $(allcols[2]).text().trim();
                let balls = $(allcols[3]).text().trim();
                let sixes = $(allcols[5]).text().trim();
                let fours = $(allcols[6]).text().trim();
                let sr = $(allcols[7]).text().trim();
                // console.log(pName);
                processPlayer(teamName, pName, result, venue, runs, balls, sixes, fours, sr);
            }
        }
        //console.log("###################");
    }
    //console.log("*****************************************");
}
function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    // workbook 
    let wt = xlsx.readFile(filePath);
    let excelData = wt.Sheets[name];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    var newWB = xlsx.utils.book_new();
    // console.log(json);
    var newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWB, newWS, name)//workbook name as param
    xlsx.writeFile(newWB, filePath);
}

function processPlayer(team, name, result, venue, runs, balls, sixes, fours, sr) {
    var obj = {
        name, runs, balls, fours, sixes, sr, team, result, venue
    };
    var teamPath = 'teams/'+team;
    if (!fs.existsSync('teams')) {
        fs.mkdirSync('teams');
    }
    if (!fs.existsSync(teamPath)) {
        fs.mkdirSync(teamPath);
    }
    var playerFile = path.join(teamPath, name) + '.xlsx';
    var fileData = excelReader(playerFile, name);
    var json = fileData;
    if(fileData==null) {
        json = [];
    }
    json.push(obj);
    excelWriter(playerFile, json, name);
}


module.exports.matchHandler = matchHandler;