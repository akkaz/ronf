# La prima PR su Ronf

Parti da una cosa piccola: scarica il progetto, aprilo sul tuo PC e cambia lo sfondo della home. Non serve conoscere tutto il codice del gioco.

## Prima di cominciare

- Account GitHub utilizzabile, Git e VS Code.
- Per il server locale: Node.js 22.13 o successivo. Controlla con `node --version`.
- Se Node non è disponibile, chiedi al docente: con Live Server già installato in VS Code puoi aprire `index.html` con **Open with Live Server**. Non serve installare dipendenze npm.

Il doppio clic su index.html non è il percorso supportato per eseguire il progetto completo. Il docente controlla prima dell’ora quale server locale è disponibile sui PC.

## 1. Fai una tua copia su GitHub

Apri [akkaz/ronf](https://github.com/akkaz/ronf), premi **Fork**, scegli il tuo account e conferma **Create fork**. Nel nuovo repository il proprietario deve essere il tuo username.

Il fork è la tua copia su GitHub. Il clone sarà la copia sul PC.

## 2. Clona il tuo fork

Nel TUO fork apri **Code → HTTPS** e copia l’indirizzo.
In VS Code: **Ctrl+Shift+P → Git: Clone**, incolla l’indirizzo e scegli una cartella contenitore nuova. Apri poi la cartella ronf creata da VS Code.

Non clonare dentro la cartella del tuo sito personale.

## 3. Crea il ramo della prova

Nel terminale della cartella ronf:

```sh
git switch -c prova-sfondo
```

Questo ramo tiene insieme la tua proposta.

## 4. Apri Ronf sul tuo PC

Nello stesso terminale:

```sh
node scripts/serve.mjs
```

Lascia aperto il terminale e visita **http://127.0.0.1:4198** nel browser. Per fermare il server: Ctrl+C. Con Live Server usa invece l’indirizzo aperto dall’estensione.

Prima di modificare, guarda la home: deve apparire la mascotte. Puoi premere Apri Ronf e scegliere **Prova senza microfono**. Per questa esercitazione non devi configurare il microfono o capire le regole del punteggio.

## 5. Cambia un valore CSS

Apri `landing.css`. All’inizio cerca la regola `body`:

```css
body{margin:0;min-width:280px;background:#eaf17f;color:#173c32;font-family:Outfit,sans-serif}
```

Cambia soltanto il valore di background in quella regola, per esempio da `#eaf17f` a `#dff2e1`. Lascia le altre proprietà come sono. Non sostituire tutte le occorrenze del colore nel file.

Salva con Ctrl+S e ricarica **la home locale** con Ctrl+R. Se avevi aperto il gioco, torna prima all’indirizzo della home. Deve vedersi il nuovo sfondo e il testo deve restare leggibile.

Il sito pubblico ronf.akkaz.dev continua a mostrare la versione pubblicata dal maintainer. Qui osservi la tua copia sul PC.

## 6. Registra la modifica e inviala al tuo fork

In Controllo del codice sorgente di VS Code apri il confronto: deve risultare cambiato **soltanto landing.css**, con il valore del background di body.

Prepara quel file, crea il commit `Cambia lo sfondo della home` e invia il ramo. Dal terminale gli stessi passaggi sono:

```sh
git add landing.css
git commit -m "Cambia lo sfondo della home"
git push -u origin prova-sfondo
```

Se Git chiede nome/email o l’accesso, usa l’identità concordata con il docente e il tuo account GitHub. Ricarica il tuo fork e controlla che il ramo prova-sfondo contenga il commit.

## 7. Se resta tempo, apri la PR

Su GitHub scegli **Compare & pull request**. Controlla:

- base repository: **akkaz/ronf**;
- base branch: **main**;
- head repository: **il tuo fork**;
- compare branch: **prova-sfondo**.

In Files changed deve esserci solo `landing.css`. Poi crea la PR con una descrizione breve:

```text
Ho cambiato il colore di sfondo della home.
Ho avviato Ronf sul mio PC e ricaricato la home locale.
Ho controllato che il nuovo sfondo si vedesse e il testo fosse leggibile.
```

Aprire una PR propone la modifica; la decisione di integrarla resta al maintainer. Le proposte di colore sono alternative: non è previsto unirle tutte.

## Il traguardo

Riesci a mostrare il progetto clonato, la pagina locale prima e dopo, il commit nel tuo fork e, se l’hai aperta, la PR? Spiega la differenza fra fork, clone e push usando proprio il lavoro che hai fatto.
