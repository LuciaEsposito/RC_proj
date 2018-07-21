# RC_proj

## UPLOAD SERVICE

Sono presenti 2 file:
   1. localServer.js 
   2. index.html
  
### 1. localServer.js
Server node che si attiva con il comando
```
  node localServer.js
```
dopo aver installato correttamente tutte le librerie per il funzionamento di NodeJS (v. https://nodejs.org/en/download/).
Una volta attivato, il server si mette in ascolto sulla porta 3000 e permette di aprire la pagina web per fare l'upload dei propri file.


### 2. index.html
Pagina web che viene aperta connettendosi a `http://localhost:3000/` da un qualsiasi browser dopo aver attivato il localServer. 



## Funzionamento
- attivare localServer.js
- connettersi a http://localhost:3000/

Viene aperta la pagina web index.html con cui l'utente può interagire. L'utente, dopo aver selezionato il tasto `Condividi`, vedrà una schermata di consenso in cui verrà gli chiesto se vuole che l'applicazione acceda ai propri file su Google Drive. Se l'utente accetta dovrà autenticarsi su Gmail e potrà selezionare il file che vuole condividere con gli altri utenti. Dopo aver selezionato il file, all'utente sarà chiesto di inserire anche dei _tag_ per specificare alcune informazioni caratteristiche del file (la materia, il professore, l'università e l'anno). Se tutto è andato a buon fine il database rispnderà con un codice che identifica il file appena condiviso.



## Chiamate REST
- http://localhost:3000/
  - GET: apre la pagina web "index.html"
  
- http://localhost:3000/use_token/

- http://localhost:3000/shared/
