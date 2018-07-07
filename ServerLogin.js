// installo le librerie
var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");  // parse incoming request bodies in a middleware before your handlers
var fs = require('fs');
const { google } = require('googleapis');

const drive = google.drive({
  version: 'v3'
});

const { OAuth2Client } = require('google-auth-library');

// inizializzo server express
var port = 3000;
var app = express();

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded; parse extended syntax with the qs module A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body). This object will contain key-value pairs, where the value can be a string or array (when extended is false), or any type (when extended is true). The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true). The "extended" syntax allows for rich objects and arrays to be encoded into the URL-encoded format, allowing for a JSON-like experience with URL-encoded. For more information, please see the qs library. Basically extended allows you to parse full objects.

// con la richiesta http://localhost:3000/ apre la pagina web principale
app.get('/', function(req, res){
	fs.readFile('indexLogin.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end(); 
	});
});

app.post('/shared', function(req, res){
        var corso = req.body.corso.toLowerCase();
        var professore = req.body.professore.toLowerCase();
        var name = req.body.Name1;
        var dict = {"Corso" : corso,
                   "Professore" : professore};
        var jsonData = JSON.stringify(dict);
	fs.writeFile("/home/biar/RC/Upsharer"+name+".json", jsonData, function(err) {
	    if(err) {
		return console.log(err);
	    }
	});
	res.write('<body style="background:#cce7ff;">');
        res.write('<p> Corso: <strong>'+corso+'</strong></p><p> Professore: <strong>'+professore+'</strong></p>');
        res.write('<p> Grazie per aver condiviso <strong>'+name+'</strong> !<p/>');
        res.write('<button onclick="goBack()">Torna alla pagina principale</button><script>function goBack() {window.history.go(-4);}</script></body>');
        res.end();
	salvaDati("/home/biar/RC/Upsharer/"+name);
});

// quando si invia la form viene fatta una POST di "use_token", al quale vengono passati i vari dati "hidden" 
app.post('/use_token', function(req, res){
	var fileid = req.body.fileID;
	var name = req.body.fileN.replace(/\s/g, '');
    
	a_t1 = req.body.oauthT;
    var fileName = name.replace(/\s/g, "");
	console.log("\nposted token --> "+a_t1+"\n");
	console.log("\nposted name --> "+name+"\n");
	console.log("\nposted id -->"+fileid+"\n");
        var body = '<body style="background:#cce7ff;"><p><strong> Inserisci i seguenti dati </p></strong><form id="IdTags" action="/shared" method ="post"><input type="hidden" name="Name1" value='+fileName+'><p>Corso:</p><input type="text" name="corso" required><br><p>Professore:</p><input type="text" name="professore" required><br></br><input type="submit" value="Invia"></form></body>';
        res.write(body);
        res.end();
		console.log("Uploading: " + fileName + '\n'); 
		var fstream = fs.createWriteStream(fileName);
        //file.pipe(fstream);
        fstream.on('close', function () {
            console.log('Done\n');
        });
        fstream.on('error',function(err){
            console.log('Error during upload: ', err);
        });
    var client = buildClient();
	
	drive.files.get({
      auth: client,
      fileId: fileid,
      alt:"media"
    }, {
            responseType: 'stream'
        },function(err, response){
            if(err){ console.log(err); return; }
            
            response.data.on('error', err => {
                console.log(err);
				return;
            }).on('end', ()=>{
                console.log(err);
            })
            .pipe(fstream);
	});
});

app.post('/registration', function(req, res){
		var username = req.body.username;
		var password = req.body.password;
		console.log("username --> "+username);
		console.log("password --> "+password);
	fs.readFile('condividi.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end(); 
	});
});

function salvaDati(uri){         
	var options = { method: 'POST',
  					url: 'https://appunti-db.herokuapp.com/db/api/v0.1/files/h9NjLjq--vs',
  					headers: 
   							{ 'postman-token': 'b08dc0bf-b118-d5bd-31cc-f8e0198bf321',
     						'cache-control': 'no-cache',
     						'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
  					formData: 
   							{ enctype: 'multipart/form-data',
     						my_file: 
      							{ value: fs.createReadStream(uri), 
        						options: 
         							{ filename: 'file',
           							contentType: null } 
      							},
						     my_file2: 
      							{ value: fs.createReadStream('/home/biar/Pictures/p.png'), 
        						options: 
         							{ filename: 'screenshot',
           							contentType: null } 
      						}
				   }
	}
	request(options, function (error, response, body) {
  		if (error) throw new Error(error);
		console.log(body);
	});
}  



function buildClient() {
  const auth = new OAuth2Client(
    "449156516773-31f4jscfjalpv5m64soa4rm7u46tjqe8.apps.googleusercontent.com",
    "cGWogSskFFTYYn9EwD8_KuPq"
  );
  auth.credentials={
    access_token: a_t1,
    expiry_date: false
  };
  return auth;
}

app.listen(port, function(){
  console.log("Express server listening on port " + port + '\n');
});