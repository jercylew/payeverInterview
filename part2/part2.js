//Cron job to scrap the user info
https = require("https");
fs = require("fs");

var page = 1;
var usersFile = "users.json";

function myFunc() {
    console.log("Scrap page: %s", page);

    var reqTemp = https.get("https://reqres.in/api/users?page=" + page, {timeout : 60000}, function (response) {
        var body = '';

        response.on('data', function(data) {
            body += data;
        });

        response.on('end', function(){
            //Data received completely
            console.log(body);

            fs.readFile(usersFile, 'utf8', function (err, data) {
                if (err) {
                    fs.writeFile(usersFile, "[" + body + "]", function(err) {
                        if (err) {
                            return console.error(err);
                        }
                    });
                }
                else
                {
                    data = JSON.parse( data );
                    data.push(JSON.parse(body));
                    //write back
                    fs.writeFile(usersFile, JSON.stringify(data), function(err) {
                        if (err) {
                            return console.error(err);
                        }
                    });
                }
             });

            // fs.appendFile(usersFile, body, function(err) {
            //     if (err) {
            //         return console.error(err);
            //     }

            //     if (page == 1) {

            //     }
            // });
        });

        response.on('error', function (err) {
            console.error(err);
        });

        
    }).on('error', function(err) {
        console.log(err)
      }).end();
      
    page++;
}

setInterval(myFunc, 60000); //1 minute