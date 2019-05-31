//Simple http server with express
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var https = require('https');
var fs = require("fs");
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(bodyParser.urlencoded({extended: false}));

//* GET http://localhost:3000/api/user/{userId} - This will make a request to https://reqres.in/api/users/{userId}
// and returns an user JSON representation.
app.get('/api/user/:userId', function(req, res) {
    console.log("Get user info with id: %s", req.params.userId);

    var reqTemp = https.get("https://reqres.in/api/users/" + req.params.userId, function (response) {
        var body = '';

        response.on('data', function(data) {
            body += data;
        });

        response.on('end', function(){
            //Data received completely
            console.log(body);
            res.end(body);
        });

        response.on('error', function (err) {
            console.error(err);
            throw e;
        });
    });
    reqTemp.end();
});

//* GET http://localhost:3000/api/user/{userId}/avatar - This will make a request to get the image by `avatar` URL.
//It should do 2 things: Save the image into the FileSystem (plain file) and return back base64 image representation.
// When another request with the same URL comes in, the server should not make a HTTP call to get the image, but should return the previously saved file in base64 format.
app.get('/api/user/:userId/avatar', function (req, res) {
    var img_file = "img_" + req.params.userId + ".data";

    console.log("Get the image for the user with id: %s", req.params.userId);

    //Image file saved as img_{userId}.data
    //Read from the file
    fs.readFile(img_file, function (err, data) {
        if (err) {
            var reqTemp = https.get("https://reqres.in/api/user/" + req.params.userId + "/avatar", function (response) {
                var body = '';
                response.on('data', function(buf) {
                    body += buf;
                });

                response.on('end', function(){
                    //Data received completely
                    console.log(body);

                    //Save the the local file (plain file)
                    fs.writeFile(img_file, body, function(err) {
                        if (err) {
                            return console.error(err);
                        }

                        res.end(Buffer.from(body).toString('base64'));
                    });
                });

                response.on('error', function (err) {
                    console.error(err);
                    throw e;
                });
            });
            reqTemp.end();
        }
        else
        {
            //Send the base64 image to the client
            res.end(data.toString('base64'));
        }
     });
});

//* DELETE http://localhost:3000/api/user/{userId}/avatar - This will remove the file from the FileSystem storage.
//When a new GET http://localhost:3000/api/user/{userId} comes in, 
//it requires a new HTTP call to get image and has to save to the fileSystem (plain file).
app.delete('/api/user/:userId/avatar', function (req, res) {
    console.log("Delete the image file for user with id: %s", req.params.userId);

    if (fs.existsSync(img_file)) {
        //Read from the file
        fs.unlink(img_file, function (err) {
            if (err) {
               return console.error(err);
            }
         });
    }
    
    res.end();
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});