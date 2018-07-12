// installo le librerie
var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var fs = require('fs');
const { google } = require('googleapis');

const drive = google.drive({
  version: 'v3'
});

const { OAuth2Client } = require('google-auth-library');

// inizializzo server express
var port = 3000;
var app = express();

app.use(bodyParser.urlencoded({ extended: false })); 

// con la richiesta "http://localhost:3000/" apre la pagina web principale
app.get('/', function(req, res){
	fs.readFile('index.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end(); 
	});
});

// gestisce la richiesta "http://localhost:3000/shared" per mandare al database "/Users/biosan/Desktop/Upsharer/" i dati e il file che si
// vuole condividere
app.post('/shared', function(req, res){
        var corso = req.body.corso.toLowerCase();
        var professore = req.body.professore.toLowerCase();
        var name = req.body.Name1;
       
	salvaDati("/Users/biosan/Desktop/Upsharer/"+name, professore, corso);
	
	// mostra un'altra schermata per ringraziare l'utente della condivisione (mostrando i dati che ha inserito) e per poter tornare 
	// sulla pagina principale e fare nuove operazioni 
	res.write('<body style="background:#cce7ff;">');
        res.write('<p> Corso: <strong>'+corso+'</strong></p><p> Professore: <strong>'+professore+'</strong></p>');
        res.write('<p> Grazie per aver condiviso <strong>'+name+'</strong> !<p/>');
        res.write('<button onclick="goBack()">Torna alla pagina principale</button><script>function goBack()' +
		  '{window.history.go(-2);}</script></body>');
        res.end();
});

// quando si invia la form viene fatta una POST di "/use_token", cioè si ha la richiesta "http://localhost:3000/use_token" 
app.post('/use_token', function(req, res){
	var fileid = req.body.fileID;			// dato hidden
	var name = req.body.fileN.replace(/\s/g, '');	// dato hidden
	a_t1 = req.body.oauthT;				// dato hidden
	
    	var fileName = name.replace(/\s/g, "");
	console.log("\naccess token --> "+a_t1+"\n");
	console.log("\nfile name --> "+name+"\n");
	console.log("\nfile id -->"+fileid+"\n");
	
	// mostra un'altra schermata in cui l'utente deve inserire il corso e il professore a cui si riferiscono gli appunti che si
	// vogliono caricare; la form viene elaborata da "http://localhost:3000/shared" 
        var body = '<body style="background:#cce7ff;"><p><strong> Inserisci i seguenti dati </p></strong>' +
	    	   '<form id="IdTags" action="/shared" method ="post"><input type="hidden" name="Name1" value='+fileName+'>' +
	    	   '<p>Corso:</p><input type="text" name="corso" required><br><p>Professore:</p><input type="text" name="professore" required>' +
	    	   '<br></br><input type="submit" value="Invia"></form></body>';
        res.write(body);
        res.end();
	
	console.log("Uploading: " + fileName + '\n'); 
	var fstream = fs.createWriteStream(fileName);
        
        fstream.on('close', function () {
            console.log('Done\n');
        });
        fstream.on('error',function(err){
            console.log('Error during upload: ', err);
        });
	
    	var client = buildClient();
	
	// API di Google Drive -> gets a file's metadata by ID
	drive.files.get({
      		auth: client,
      		fileId: fileid,
      		alt:"media"
    	}, {
            responseType: 'stream'
        }, function(err, response){
           	if(err){ 
			console.log(err); 
			return; 
		}
	        response.data.on('error', function(err){
	                console.log(err);
			return;
        	}) .on('end', function(){
                	console.log(err);
            	}) .pipe(fstream);
	});
});

// funzione che manda i dati al database
function salvaDati(nomeFile, professore, corso){         
	var options = { method: 'POST',
  			url: 'https://appunti-db.herokuapp.com/db/api/v0.1/notes',
  			headers: 
   			{ 'postman-token': '2c3b27cd-a6fd-1e42-1d85-4b3987e30b4d',
     		  	  'cache-control': 'no-cache',
     		   	   authorization: 'Basic YWxlc3NhbmRybzpwYXNzd29yZDEyMzQ=',
     		  	  'content-type': 'application/json' },
  			body: 
   			{ name: name,
     		  	  owner: '',
     		  	  teacher: professore,
     		  	  subject: corso,
     		  	  university: 'sapienza',
     		  	  year: '2017',
     		  	  tags: [ 'testtesttest' ] },
  			json: true };

	request(options, function (error, response, body) {
  		if (error) throw new Error(error);
			console.log(body);
	});
}    

// funzione che crea il client con le sue credenziali oauth
function buildClient() {
  const auth = new OAuth2Client(
    "449156516773-31f4jscfjalpv5m64soa4rm7u46tjqe8.apps.googleusercontent.com",		// client id
    "cGWogSskFFTYYn9EwD8_KuPq"								// client secret
  );
  auth.credentials={
    access_token: a_t1,
    expiry_date: false
  };
  return auth;
}

// attivo il server express che si mette in ascolto sulla porta 3000
app.listen(port, function(){
  console.log("Server Express in ascolto sulla porta: " + port + '\n');
});
