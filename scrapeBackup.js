var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var util = require('util');

//var connection = require(__dirname + '/config/db');

exports.scape = function(req, res) {
    // var url = 'https://www.flightcentre.com.au/holidays/search?fdeparture=Adelaide';

    // var fileName = "Adelaide";
    // var path = __dirname + '/json/' + fileName + '.json';
    // if (!fs.existsSync(path)) {
    //     fs.writeFile(path, '');
    // } else {
    //     console.log('Already there');
    // }

    // // 51 is Total number of pages in this url
    // for (var x = 0; x < 51; x++) {
    //     setTimeout(function(y) {
    //         Scrap(url, y, path);
    //     }, x * 16000, x); // we're passing x
    //     //16000 means 16 Second, it will tack 16 Second for one page to scrape data
    // }
}

var total=0;
//startJob();

function startJob() {
    var url = 'https://www.studentflights.com.au';
    var fileName = "studentHolliday";
    var path = __dirname + '/json/' + fileName + '.json';
    if (!fs.existsSync(path)) {
        fs.writeFile(path, '');
    } else {
        console.log('Already there');
    }
    // 51 is Total number of pages in this url
    for (var x = 0; x < 24; x++) {
        setTimeout(function(y) {
            ScrapStudent(url, y, path);
        }, x * 20000, x); // we're passing x
        //16000 means 16 Second, it will tack 16 Second for one page to scrape data
    }
}

function ScrapStudent(u,y,path){
    console.log('Page number  '+y);
    var url = u + "/holidays/search?page=" + 0;
  request(url,function(err,res,html){
    if(!err){
        var $ = cheerio.load(html);
            var data = $(this);
            $('a.sf-submit-button-flat').each(function(x) {
                var data = $(this);
                var alldata={};
                if(data.attr("href")!="/stores")
                {
                    var childUrl=u+data.attr("href");
                    var parantData=data.parent().prev();

                    alldata["duration"]=parantData.children('.duration').children('.value').text(); 
                    alldata["package_name"]=parantData.children('a.product-title').children().text();
                    alldata["destination"]=parantData.children('.destination').text().split("\n")[2].trim();
                    alldata["operator"]=parantData.children('.operator').text().split("\n")[2].trim();

                   // console.log(alldata);
                    // // scrape child data using url
                    setTimeout(function(z) {
                        ScrapInnerData(childUrl,alldata,z,path);
                    }, x * 1500, x);
                }             
            }); 
    }
    else{
        console.log('Error for request',err);
    }
  })   
}
//ScrapInnerData("https://www.studentflights.com.au/product/4737299",{},1)
function ScrapInnerData(url,alldata,y,path) {
    console.log('url',url,y);
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var data = $(this);
            alldata['url']=url;
            $('.everyone').each(function(e){
                var data = $(this);
                var price= data.text();
                price=price.slice(1,-1);
                alldata["price"]=price;
            })
            var ex=$('.sf-prodinfo-expire').text().trim().split('/');
            var exDD=ex[0].slice(-2);
            var exMM=ex[1];
            var exYY='20'+ex[2];
            alldata["expire"]=exDD+'/'+exMM+'/'+exYY;
            
            var date=$('.sf-readmore').text().trim();
            date =date.split(',')[0];

            //console.log('date',date);
            if(date.indexOf("dates")<0){
                date=getDate(date);
                alldata["dates"]=date;
            }
            else{
                date =date.substring(date.indexOf("dates"),date.length);
                date=getDate(date.slice(5)); 
                alldata["dates"]=date;
            }
            
            var description=$('.sf-prodinfo-description').children()[1];

            $('div.sf-prodinfo-description p').each(function(e){
                var newData=$(this);   
                if(newData.text().includes('$')){
                    var departing=newData.text();
                    departing=departing.substring(departing.indexOf(":"),departing.length).slice(1);
                    departing=departing.split("\n");
                    var all=[];
                    for(var i=0;i<departing.length;i++){
                        if(departing[i].split("from").length>1){
                            var storeData={};
                            storeData["url"]=url;
                            storeData["TravelDate"]=alldata.dates;
                            var value=departing[i].split("from")[0].trim();
                            var price=departing[i].split("from")[1].trim().substr(1).slice(0, -1);
                            storeData["price"]=price;
                            storeData["destination"]=value;
                            storeData["expire"]=alldata.expire;
                            storeData["duration"]=alldata.duration;
                            storeData["package_name"]=alldata.package_name;
                            storeData["destination"]=alldata.destination;
                            storeData["operator"]=alldata.operator;
                            //console.log('storeData',storeData);

                            total++;
                             all.push(storeData);
                             //Here first read file file 
                        }   
                    }

                    fs.readFile(path, function(err, d) {
                        if (isEmptyObject(d)) {
                            var json = all;
                        }
                        else {
                            var json = JSON.parse(d)
                            json = json.concat(all)
                        }
                        console.log('storeData', total);
                        //after read file append new data in old
                        var fileName = "studentHolliday";
                        var path = __dirname + '/json/' + fileName + '.json';
   
                        fs.writeFile(path, JSON.stringify(json, null, 4))
                    });
                }       
            })            
        } else {
            console.log('Error', error);
        }
    });
}

// First time it will check json file is empty or not
function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

//Get date from two date 
/**
 * if date is like 20 February - 6 March 2018 it will return
 *  20/2/2018-6/3/2018
 * here this data is From to To
 */
function getDate(d) {
    d=d.replace('.','');
    d=d.replace('  ',' ');
    var date = d.trim().split('-');
    var year = new Date(date[1]).getFullYear();
    var mm = date[0].trim().split(" ");
    if (!mm[1]) {
        var toDate = new Date(date[1]);
        var from = toDate.setMonth(toDate.getMonth() - mm);
        var from = new Date(from).setMonth(mm - 1)
    } else {
        var from = date[0] + ' ' + year;
    }
    var to = date[1]
    return dateFormate(from) + '-' + dateFormate(to)
}

// Return date in format of dd/mm/yyyy
function dateFormate(d) {
    var date = new Date(d);
    var mm = parseInt(date.getMonth()) + 1;
    return date.getDate() + '/' + mm + '/' + date.getFullYear();
}