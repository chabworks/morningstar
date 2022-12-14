const fs = require("fs");
const puppeteer = require("puppeteer");

const glob = require("glob");


const https = require('https');

const { GoogleSpreadsheet } = require('google-spreadsheet');
setTimeout(process.exit, 10*60*1000, 0);
const creds = require('./sheetlogins.json');


//main sheet
const doc = new GoogleSpreadsheet('1TLGVMRISYnU-XDZ9SdoTS5M-VCGxk3pCOdCO3XH38qQ');

//test sheet
// const doc = new GoogleSpreadsheet('1wYrbhZBv9YvrPRbNPFOOXsa2Lclk2CQHPyiVk9Vyqjk');

let snap_name = new Date().toJSON().slice(0, 10);

// var shell = require('shelljs');
// shell.exec('taskkill /f /im chrome.exe & ver > nul')

// Asynchronous version
// fs.unlink('data/'+todayDate+'.json', function(err) {
//     if(!err) {
//         console.log('File deleted '+'data/'+todayDate+'.json');
//     }    
// })


console.log('\nScript is initiating. Please Wait..!\n');

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


function flattenObject(ob) {
    var toReturn = {};
        for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
                if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                                toReturn[i + '_' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}






let browser = null;

async function captureScreenshot() {



try {
  

let user_data_dir = './myUserDataDir';

    if (!fs.existsSync(user_data_dir)){
        fs.mkdirSync(user_data_dir);
    }

let final_data=[];
let window_all_DONE=false;


await doc.useServiceAccountAuth(creds);
await doc.loadInfo();
console.log(doc.title);

var currentValues = [];
var cellValues = [];
var identityvlas = {};
const sheet = await doc.sheetsByTitle['Sheet1'];
const inprows = await sheet.getRows({ offset: 0, limit: 5000000});

for(var i = 0; i < inprows.length; i++){
  if(inprows[i]["date_time"] != 'undefined' && inprows[i]["date_time"].includes("/")){
    cellValues.push(inprows[i]["date_time"]);
    // identityvlas[inprows[i]["URL to Scrape"]] = {"Site Name":inprows[i]["Site Name"],"Time of Scrape":cuerenr_time}
  }
}
console.log(cellValues);

let browser_args = ['--window-size=1366,768',
    '--disable-gpu','--no-sandbox', "--disable-features=IsolateOrigins,site-per-process", '--blink-settings=imagesEnabled=true'  , '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials' 
];

browser = await puppeteer.launch({
    headless:true,
    ignoreHTTPSErrors: true,
    userDataDir:user_data_dir,
    slowMo: 0,
    args: browser_args,
    ignoreDefaultArgs: ["--enable-automation"]
});


const page = await browser.newPage({context: `${Math.random()}`});


await page.goto("https://finra-markets.morningstar.com/BondCenter/TRACEMarketAggregateStats.jsp", {waitUntil: 'load', timeout: 0});


await new Promise(resolve => setTimeout(resolve, 4000));

await page.goto("https://finra-markets.morningstar.com/transferPage.jsp?path=http://muni-internal.morningstar.com/public/MarketBreadth/C", {waitUntil: 'load', timeout: 0});


await page.evaluate((inject_js)=>{
      var jq = document.createElement("script");jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js?fdfg=sd", document.getElementsByTagName("head")[0].appendChild(jq);
      return 'jQuery injected';

      return true;
  }).then(console.log);

await new Promise(resolve => setTimeout(resolve, 700));


await new Promise(resolve => setTimeout(resolve, 500));
// console.log(window_all_DONE)
result = await page.evaluate(() => {
  window.final_data = [];
  window.window_all_DONE = false;



$(document).ready(function(){  
      function formatDate(date) {
        var date_format = date.split(', ')
        var inputs_dates=date_format[0].split('/');
        if (typeof date_format[1] == 'undefined') {date_format[1] = '00:00:00';}
        return (
          [
            padTo2Digits(inputs_dates[0]),
            padTo2Digits(inputs_dates[1]),      
            inputs_dates[2].split('').slice(2,4).join('')
          ].join('/') +
          ' ' +
          date_format[1]
        ).replace(' 24:',' 00:');
      }
      function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
      }


      var todaysd = new Date();
      var datafileDate =  formatDate( new Date(todaysd.setDate(todaysd.getDate() - 1)).toLocaleString('en-US', { timeZone: 'America/New_York' }) ).split(' ')[0]

      to_be_push = {};
      to_be_push["total_issues"] = '';
      to_be_push["advances"] = '';
      to_be_push["declines"] = '';
      to_be_push["date_time"] = '';

      // var datafileDate = current_date_for_data;

      if ($('table tbody tr').length) {

        var date_for_data = $('table').attr('data-fileDate');

        // datafileDate = new Date(date_for_data).toLocaleDateString(undefined,{year:'2-digit', month:'2-digit', day:'2-digit'});
        datafileDate = formatDate( new Date(date_for_data).toLocaleString('en-US') ).split(' ')[0]

        $('tbody tr').each(function(index, tr) {
            $(tr).find('td').each (function (index, td) {
                if($(td).parent().find('th').text() == "Total Issues Traded"){
                    to_be_push["total_issues"] = $(td).parent().find('td:nth-child(4)').text().trim();
                }
                else if($(td).parent().find('th').text() == "Advances"){
                      to_be_push["advances"] = $(td).parent().find('td:nth-child(4)').text().trim();
                }
                else if($(td).parent().find('th').text() == "Declines"){
                      to_be_push["declines"] = $(td).parent().find('td:nth-child(4)').text().trim();
                }
            });
        });
      }


      
      to_be_push["date_time"] = datafileDate;

      window.final_data.push(window.to_be_push);

      console.log(window.final_data);
      if (window.final_data.length) {window.window_all_DONE = true;}  

  });


});
await new Promise(resolve => setTimeout(resolve, 1000));

for (let i = 0; true; i++) {

 result = await page.evaluate(() => {
     if(window_all_DONE){
       return {"first":true,second:window.final_data};
     }else{
       if ("undefined" != typeof  final_data) {
         return {"first":'Total Data: ' + final_data.length,second:''};
       }else{
         return {"first":false,second:''};
       }
     }
   })

// console.log(result["second"]);

await new Promise(resolve => setTimeout(resolve, 1000));

     if (typeof result["first"] == 'boolean' && result["first"]) {

       let jsonstr = JSON.stringify(result["second"]);       
       // fs.writeFileSync('data/'+todayDate+'.json', jsonstr);
       // console.log("\n\n"+'Success! File Exported to: '+'data/'+todayDate+'.json'+"\n\n");

          if(result["second"].length){     
            
            let sheetaddRow_res;
            for (let ins =0; ins<result["second"].length ;ins++) {

                  try{

                    if(cellValues.indexOf(result["second"][ins]['date_time']) === -1){

                         sheetaddRow_res = await sheet.addRow(result["second"][ins]);
                          await new Promise(resolve => setTimeout(resolve, 850));
                      }
                      else{
                        console.log( "\n\n"+"Already data available for this date...." )
                      }                    
                    
                   
                  }catch(err){
                    console.log('Erroes in add rowes '+err);
                  }

            }
          }

      break;
     }else{
       console.log(result["first"]);
     }


  if(i>100000) break;
  }
      // await page.screenshot({ path: 'screenshots/'+makeid(5)+'.jpeg' });
    } catch (err) {
      console.log(`??? Error: ${err.message}`);
      // await page.screenshot({ path: 'screenshots/'+snap_name+'_'+makeid(5)+'.jpeg' });
    } finally {
      // await page.screenshot({ path: 'screenshots/'+snap_name+'_'+makeid(5)+'.jpeg' });
      await browser.close();
      console.log(`\n ALL Done!`);
      process.exit()
    }
}

captureScreenshot();
