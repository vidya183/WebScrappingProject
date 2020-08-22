var cheerio = require("cheerio")
var fs = require("fs")
var request = require("request");
var matchFile = require("./allMatches.js")
var url = "https://www.espncricinfo.com/scores/series/8039/season/2015/icc-cricket-world-cup";

request(url, cb)

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
    var $ = cheerio.load(body)
    var aPageAnchor = $("a[data-hover='View All Results']");
    var link = aPageAnchor.attr("href");
    var cLink = "https://www.espncricinfo.com/" + link;
    matchFile.allMatchHandler(cLink);
}