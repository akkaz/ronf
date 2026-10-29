# Ronf 💤

**Fate squadra. Non svegliatela.**

Un gioco cooperativo per il rumore in aula. La mascotte dorme quando c’è calma, la classe guadagna esperienza e conquista i premi scelti con il docente.

**[Usa Ronf su ronf.akkaz.dev](https://ronf.akkaz.dev)** · [Segnala un problema](https://github.com/akkaz/ronf/issues)

## Per usarlo in classe

1. Apri il sito sul computer collegato alla LIM e premi **Apri Ronf**.
2. Al primo avvio segui tre passaggi: accendi il microfono, misura cinque secondi di silenzio (oppure salta), scegli o aggiungi la classe.
3. Premi **Avvia la lezione**. Nei successivi accessi puoi partire subito o rifare la preparazione. Durante il wizard non si guadagnano punti e non si consuma pazienza.
4. Scegli mascotte e premi nelle impostazioni. Le conseguenze sono facoltative, inizialmente vuote.
5. Usa **Pausa** mentre spieghi; **Termina** conclude la lezione e conserva XP e record.

Puoi esplorare il gioco con **Prova senza microfono**, senza salvare punti. Il rumore adatto dipende dall’attività: regola le soglie per il lavoro individuale o di gruppo. La home mostra automaticamente le 17 mascotte e i loro stati: il nome nel titolo segue il personaggio. Il giro si ferma al passaggio del mouse e con l’opzione di sistema per ridurre il movimento; il comando di pausa è raggiungibile da tastiera.

Gli **XP** fanno crescere il livello tra lezioni; l’**energia** riparte da zero e determina i premi della lezione. Le combo moltiplicano gli XP, non l’energia. Il docente può aggiungere o togliere energia manualmente.

## Dati e microfono

- Nessun account, database, registrazione o invio di audio. Il segnale viene elaborato in memoria sul dispositivo.
- Font e immagini sono inclusi nel sito; il gioco non effettua richieste ad API o servizi esterni. Il provider che serve i file può conservare i propri log HTTP: questo progetto non contiene analytics o traccianti.
- Classi, preferenze, XP e record restano nel browser. Chi usa lo stesso profilo browser può accedervi. Usa nomi di classe e non inserire dati degli studenti.
- Cancellare i dati del sito elimina i salvataggi. La navigazione privata può eliminarli alla chiusura.
- In **Impostazioni → Porta Ronf con te** esporti un backup JSON. Per trasferirti, apri Ronf sull’altro computer e importalo: un riepilogo e una conferma precedono la sostituzione dei dati. Il backup trasferisce impostazioni e progressi, non la lezione in corso né l’identificativo del microfono. Ricontrolla la taratura sul nuovo dispositivo.
- I dB sono stime del browser, non misure certificate. Taratura e posizione del microfono cambiano il risultato.
- Per il microfono serve HTTPS, oppure `localhost` sullo stesso computer. Aprire `index.html` con un doppio clic non è il percorso supportato.

## Eseguire una propria copia

Ronf è un sito statico HTML/CSS/JavaScript. Non servono chiavi, Docker, database o dipendenze npm. Node.js 22.13 o successivo serve solo per i comandi di sviluppo e i test.

```sh
git clone https://github.com/akkaz/ronf.git
cd ronf
npm start
```

Apri **http://127.0.0.1:4198**. Il server di sviluppo ascolta solo sul computer locale. Per una scuola condivisa in rete pubblica i file tramite un hosting HTTPS.

```sh
npm test
npm run build
```

Pubblica il contenuto di `dist/` su un hosting statico HTTPS. Tutti i percorsi sono relativi: è possibile ospitare Ronf anche in una sottocartella. Su Vercel: importa il repository, comando build `npm run build`, cartella output `dist`. Il file `vercel.json` include le intestazioni per microfono e risorse locali; su altri hosting applica intestazioni equivalenti se disponibili.

## Contribuire

Prima volta con GitHub? Segui [La prima PR su Ronf](PRIMI-PASSI.md): fork, clone, avvio sul PC e una piccola modifica allo sfondo della home.

Per bug e proposte apri una issue indicando browser, dispositivo, passaggi e comportamento atteso. Non allegare audio dell’aula, nomi o dati degli studenti. Per una modifica, crea un branch e una pull request e verifica `npm test` e il gioco su computer e telefono.

- `app.js`: microfono, regole della lezione, UI e salvataggi locali.
- `entry.js`: ingresso animato e rotazione delle mascotte nella home.
- `setup-flow.js`: flusso della preparazione e calcolo delle soglie.
- `game-data.js`: mascotte e progressione dei livelli.
- `backup.js`: formato e validazione dei backup.
- `lesson-clock.js`: promemoria facoltativi secondo l’ora locale.
- `ASSETS.md`: provenienza delle illustrazioni e prompt delle mascotte generate con AI.

Nato dall’esperienza in aula di **Gio Marco Baglioni**. La versione pubblica è autonoma: non accede all’archivio scolastico del progetto originale.

## Licenza

Codice e illustrazioni del progetto: **[MIT](LICENSE)**. Atkinson Hyperlegible, Bungee, Outfit e Caveat mantengono le rispettive **SIL Open Font License 1.1**, incluse in `assets/fonts/`. Il marchio GitHub proviene da Octicons (licenza MIT in `assets/LICENSE-octicons.txt`). Le illustrazioni delle mascotte aggiuntive sono state generate con AI, come documentato in `ASSETS.md`.
