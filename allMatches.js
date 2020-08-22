var cheerio = require("cheerio")
var fs = require("fs")
var request = require("request");
const { parseHTML } = require("cheerio");
var matchFile = require("./match.js")
var url = "https://www.espncricinfo.com/scores/series/8039/season/2015/icc-cricket-world-cup?view=results";

function allMatchHandler(){
    request(url, cb)
}

function cb(err, header, body){
    if(err==null && header.statusCode==200){
        console.log("response received")
        parseHtml(body)
    } else if(header.statusCode==404){
        console.log("page not found")
    } else {
        console.log(err)
        console.log(header)
    }
}

function parseHtml(body){
    var $ = cheerio.load(body);
    var allMatches = $(".col-md-8.col-16");
    console.log(allMatches.length)
    for(let i=0; i<allMatches.length; i++){
        var allAnchors = $(allMatches[i]).find(".match-cta-container a");
        var scorecardA = allAnchors[0]
        var link = $(scorecardA).attr("href")
        var cLink = "https://www.espncricinfo.com/" + link;
        //console.log(cLink)
        matchFile.matchHandler(cLink)
    }
}

module.exports.allMatchHandler = allMatchHandler