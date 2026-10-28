---
name: Ronf
description: "Mascotte originali, lime e lettere grandi: dalla home al tabellone della classe."
colors:
  lime: "#eaf17f"
  ink: "#173c32"
  ink-hover: "#2e5545"
  cream: "#fffdf3"
  selection: "#f4ad8b"
  hand-underline: "#d47649"
  muted: "#4b6252"
  line: "#c9d2ae"
  control-hover: "#edf1cf"
  hud-border: "#b9c89e"
  field-border: "#7e9468"
  setup-secondary-hover: "#dce677"
  setup-secondary-active: "#d0dd6d"
  white: "#ffffff"
  night-board: "#1b2850"
  xp-gold: "#f3d582"
  calm: "#2e8b57"
  calm-label: "#246c43"
  warning: "#e3a008"
  alert: "#d63a2c"
  warning-paper: "#f6ebcb"
  alert-paper: "#f4d6cf"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(3rem, 6vw, 5.25rem)"
    fontWeight: 900
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  brand:
    fontFamily: "Outfit, sans-serif"
    fontSize: "2.3rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.04em"
  body-landing:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.5
  label-landing:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.2
  annotation-landing:
    fontFamily: "Caveat, sans-serif"
    fontSize: "4rem"
  welcome-title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  body-board:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.45
  label-board:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
  readout:
    fontFamily: "Outfit, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 1
  setup-secondary:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.3
  quiet-count:
    fontFamily: "Outfit, sans-serif"
    fontSize: "5rem"
    fontWeight: 800
    lineHeight: 1
rounded:
  field-compact: "0.5rem"
  field: "0.6rem"
  control: "10px"
  hud: "0.8rem"
  panel: "1rem"
  dialog: "1.1rem"
  setup-secondary: "12px"
  pill: "99px"
spacing:
  xs: "0.4rem"
  sm: "0.5rem"
  md: "0.8rem"
  lg: "1rem"
  xl: "1.5rem"
  section: "2rem"
  board-gap: "clamp(10px, 1vw, 20px)"
components:
  button-landing:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.label-landing}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.25rem"
    height: "54px"
  button-landing-hover:
    backgroundColor: "{colors.ink-hover}"
  button-landing-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label-landing}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.25rem"
    height: "54px"
  button-landing-secondary-hover:
    backgroundColor: "{colors.cream}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.control-hover}"
  button-danger:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
  button-setup:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.3rem"
    height: "54px"
    width: "100%"
  button-setup-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.setup-secondary}"
    rounded: "{rounded.setup-secondary}"
    padding: "0.65rem 1rem"
    height: "44px"
  button-setup-secondary-hover:
    backgroundColor: "{colors.setup-secondary-hover}"
  button-setup-secondary-active:
    backgroundColor: "{colors.setup-secondary-active}"
  input-text:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.5rem 0.65rem"
  input-new-class:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.8rem"
  chip-class:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.28rem 0.85rem"
  chip-class-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  card-hud:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.hud}"
    padding: "0.9rem 1rem"
  setup-container:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "1.5rem"
    width: "100%"
---

# Design System: Ronf

## Overview

**Creative North Star: "Il rifugio della marmotta"**

Ronf usa un unico vocabolario dalla home al gioco: lime, inchiostro verde scuro, crema e Outfit largo e pesante. Il tono è breve, ironico e da aula. Caveat rimane la piccola voce a penna accanto al personaggio; sul tabellone la scena alpina e le grandi misure mantengono il ruolo principale.

Le 17 mascotte sono quelle reali del gioco, con quattro pose ciascuna, senza ridisegnare gli asset originali. La faccia addormentata della marmotta identifica Ronf in tutte le testate. La composizione cambia secondo l’uso: invito nella home, una decisione per passaggio nell’avvio, scena e controlli operativi nel tabellone. Le scelte delle superfici sono registrate in `.impeccable/surfaces/index-html.md` e `.impeccable/surfaces.md`.

**Key Characteristics:**
- Lime, verde scuro e crema condivisi da home, avvio e gioco.
- Outfit per marchio, titoli, testi e misure; Caveat per il solo «sssh.».
- Mascotte originali e nome sincronizzato, sottolineato come a mano.
- Movimento breve e giocoso, con pausa e movimento ridotto.
- Preparazione essenziale, con una CTA e una riga secondaria pertinente.
- Stato sonoro comunicato con colore, testo e cambiamento della scena.

Rilevato dal codice il 28 ottobre 2026 dopo gli aggiornamenti autorizzati del mondo A1. Fonti: `index.html`, `landing.css`, `entry.js`; cascata del gioco `board.css` → `lesson-board.css` → `ronf.css`, `gioca.html`, `app.js`, `setup-flow.js`, `game-data.js` e `mascot-frames.js`. Le dichiarazioni Bungee/Atkinson rimaste nei fogli ereditati non definiscono la tipografia corrente: prevale Outfit negli override finali.

## Colors

Lime accoglie e orienta; verde scuro sostiene testi e azioni; crema ospita letture e controlli. Il paesaggio e i segnali del rumore conservano i loro colori semantici. I valori normativi sono nel frontmatter.

### Primary
- **Inchiostro** (`ink`): testo, marchio, pulsanti principali, focus, combo e storico. Nel gioco corrisponde anche ai token CSS ereditati `--forest` e `--violet`, ora allineati allo stesso verde. `ink-hover` è l’hover del principale.

### Secondary
- **Lime** (`lime`): fondo della home e dell’avvio, testata del gioco e avanzamento di livello.
- **Tratto a penna** (`hand-underline`): sottolineatura del nome della mascotte nella home.
- **Notte alpina** (`night-board`): fondale della scena del gioco, che conserva notte, alba, giorno e allarme.
- **Oro XP** (`xp-gold`): totale XP; non sostituisce i colori del livello sonoro.

### Tertiary
- **Calma** (`calm`, `calm-label`): barra e stato favorevole; la variante più scura sostiene il testo bianco del pill.
- **Attenzione** (`warning`, `warning-paper`): avvicinamento alla soglia e fondo intermedio.
- **Allarme** (`alert`, `alert-paper`): soglia superata, fondo di allarme e azioni distruttive.

### Neutral
- **Crema** (`cream`): fondo del gioco in calma, pannelli di misura e punteggio, controlli e testo del pulsante pieno.
- **Bianco** (`white`): campi ereditati e alcuni contenitori del percorso della lezione.
- **Verde secondario** (`muted`): spiegazioni e testi meno prominenti.
- **Righe e bordi** (`line`, `hud-border`, `field-border`): separatori, misure e campi.
- **Feedback dei controlli** (`control-hover`, `setup-secondary-hover`, `setup-secondary-active`): superfici di risposta a hover e pressione.
- **Pesca della selezione** (`selection`): testo selezionato, con inchiostro verde scuro.

**The State Has Words Rule.** Ogni stato sonoro conserva un nome leggibile e un riscontro nella scena; il colore da solo non comunica il significato.

## Typography

**Font principale:** Outfit variabile, con fallback sans-serif, in home, wizard, tabellone e dialoghi.
**Annotazione:** Caveat variabile, con fallback sans-serif, solo per «sssh.» nella home.

Titoli e marchi sono larghi, pesanti e serrati; testi e controlli restano brevi e leggibili. I grandi numeri del gioco usano peso (800) e numeri tabulari dove previsto. I font sono locali.

### Hierarchy
- **Display** (`display`): payoff della home, massimo (13ch). Entro (700px) usa `clamp(2.8rem, 11.4vw, 4.5rem)`. L’emoji 🤫 appartiene al titolo scelto dall’autore e conserva un nome accessibile.
- **Marchio** (`brand`): nome Ronf e volto originale; nella home scende a (1.8rem) entro (700px), nell’avvio a (2rem) entro (620px). La testata operativa usa (2rem).
- **Body della home** (`body-landing`): spiegazione in due blocchi, massimo (35ch); sul telefono (1.06rem) e (34ch).
- **Azioni della home** (`label-landing`): stessa gerarchia per Apri Ronf e GitHub.
- **Annotazione** (`annotation-landing`): inclinazione statica di (9deg), dimensione (3rem) entro (900px).
- **Titolo di avvio** (`welcome-title`): domanda breve, peso (900); entro (620px) usa (2.7rem). La descrizione finale usa (1.1rem), ridotta a (1.05rem) sul telefono.
- **Body e label del gioco** (`body-board`, `label-board`): interfaccia e dialoghi. I testi lunghi arrivano a circa (68ch).
- **Readout** (`readout`): livello sonoro; il telefono usa la scala compatta della scena. Combo, pazienza e punteggio mantengono scale proprie.
- **Secondario di avvio** (`setup-secondary`): peso più leggero della CTA e nessuna sottolineatura.
- **Conto alla rovescia** (`quiet-count`): grande numero durante la misura; il relativo stato è annunciato anche alle tecnologie assistive.

**The Room First Rule.** Sul tabellone conservare la gerarchia fra numero grande, nome della misura e spiegazione secondaria: deve funzionare per chi guarda dalla classe.

## Layout

La home mantiene il contenitore massimo di (1440px), alto almeno `100svh`, con margini interni di (5vw). Testata e footer delimitano l’area principale flessibile: griglia (1.3fr / 1fr) centrata verticalmente, gap (3rem) e (1rem) entro (900px). Il personaggio occupa una scena quadrata nella colonna destra; il nome sincronizzato rimane nel titolo a sinistra.

Entro (700px) la home usa una colonna con margini di (6vw), testo e azioni prima della mascotte, gap (2rem) e scorrimento naturale. La figura è larga al massimo (310px), allineata a destra. Le azioni possono andare a capo nel gruppo massimo di (360px), con gap (.75rem) e base flessibile (150px). Il footer diventa verticale.

L’avvio occupa il campo lime ed è centrato, con contenitore trasparente largo al massimo (34rem) e padding finale (1.5rem). Entro (620px) il padding diventa (1.1rem .65rem). Marchio e piccola marmotta precedono tre punti di avanzamento; seguono titolo, contenuto del solo passaggio attivo, CTA a tutta larghezza e una riga secondaria. Gli accessi rapidi nascondono i punti di avanzamento.

Il tabellone conserva il rem fluido `clamp(14px, calc(.62vw + .55vh), 26px)` e `board-gap`. La scena contiene mascotte centrale, livello/XP in alto a sinistra, misure a destra e combo/punteggio in basso; storico ed energia occupano la regione inferiore. Oltre (1100px) e da (700px) di altezza, l’app usa l’altezza del viewport; sotto scorre verticalmente. Entro (620px) la scena ha minimo (49rem), misure affiancate e toolbar a due colonne con l’ultima azione estesa su entrambe.

## Elevation & Depth

Home e wizard sono piatti: fondo lime, personaggi, testo e azioni senza carte o ombre aggiunte. L’ombra illustrata appartiene agli asset originali. Il tabellone usa campi di colore, bordi e livelli del paesaggio; la scena non ha ombra. I dialoghi e i promemoria conservano elevazione funzionale.

### Shadow Vocabulary
- **Dialogo:** `0 12px 46px rgba(10,27,24,.22)`; override corrente dei dialoghi operativi.
- **Cambio ora:** `0 8px 32px rgba(10,27,24,.25)`; promemoria.
- **Premio raggiunto:** `0 3px 0 #aa7218`; medaglia attivata.

Il movimento accompagna il cambio di personaggio, l’ingresso nel gioco, i passaggi del wizard e gli stati della scena. Le durate esatte sono nel sidecar. `prefers-reduced-motion` impedisce la rotazione automatica e salta le transizioni di ingresso e del wizard, oltre a disattivare le animazioni del gioco.

## Shapes

Marchio e personaggi mantengono sagome originali, senza contenitori illustrati aggiunti. Il nome variabile della home riceve un tratto sottile, curvo e inclinato di (-1.5deg), nel colore dedicato.

Pulsanti ordinari e selettore di classe condividono `control`; le azioni secondarie del wizard usano `setup-secondary`. Misure e punteggio conservano `hud`, pannelli e scena `panel`, dialoghi `dialog`. Chip e barre mantengono estremità rotonde. I punti dell’avanzamento sono cerchi di (9px), vuoti o pieni secondo `aria-current`.

## Components

### Buttons

- **Home:** Apri Ronf pieno e GitHub outline, altezza minima (54px), bordo (1.5px) e icone originali. Il principale apre il gioco mantenendo il documento genitore; l’URL resta condivisibile. GitHub apre il codice in un’altra scheda.
- **Gioco:** principali verdi e secondari crema, raggio `control`, altezza minima base (40px), testo `max(.95rem, 12px)`. La toolbar mobile mantiene i propri override compatti. Hover cromatico e pressione di (1px).
- **Wizard:** principale pieno a tutta larghezza, altezza minima (54px). Sotto, solo i secondari pertinenti in una riga outline, altezza minima (44px), bordo (1px), raggio `setup-secondary`, nessuna sottolineatura. Hover e pressione usano i colori dedicati.
- **Distruttivo:** bordo rosso e testo rosso scuro; la variante armata è piena rossa con testo bianco.
- **Focus:** contorno verde visibile di (3px), offset (6px) nella home e (3px) nel gioco. Lo skip link della home compare al focus. Disabilitato: opacità (.55) e cursore normale.

### Chips

La classe usa pill crema, bordo e testo verde; la selezione è verde piena con testo bianco e `aria-pressed`. Il chip demo conserva il bordo tratteggiato, ora verde, e si distingue dalla modalità microfono.

### Cards / Containers

Le misure e il punteggio sono crema con bordo `hud-border`, angoli `hud` e separatori `line`. Lo storico è verde scuro con testo chiaro. Il wizard è un contenitore trasparente sul lime, senza ombra o carta sovrapposta. I dialoghi mantengono la loro superficie crema.

### Inputs / Fields

I campi ereditati mantengono bordo verde grigio e raggio `field`. Il campo Nuova classe usa fondo crema, bordo `field-border`, raggio `control`, etichetta e placeholder leggibili. Il selettore di classe del wizard è largo quanto la riga e alto almeno (48px). Range e checkbox usano il verde; i range conservano un output testuale. Il focus è condiviso con i pulsanti.

### Navigation

Home, avvio e gioco mostrano il volto addormentato della marmotta e Ronf in Outfit con punto finale. L’ingresso mantiene una sola istanza del gioco in un iframe della stessa origine: apertura, caricamento e ritorno sono animati, l’URL usa la History API e il tasto indietro riporta alla home. Il collegamento diretto a `gioca.html` resta valido. Nel gioco impostazioni e spiegazioni appartengono alla toolbar.

### Mascots and setup

La home presenta le 17 mascotte di `MASCOT_CATALOG`: una posa circa ogni secondo, quattro pose prima del personaggio successivo. Nome e personaggio cambiano insieme; il nome mantiene il tratto a mano. Hover sul personaggio sospende la rotazione; il comando di pausa compare al focus da tastiera. Nessun comando visibile per cambiare manualmente animale. Con movimento ridotto la scena resta statica. Durante il gioco aperto o con documento nascosto la rotazione non avanza.

Gli sprite riusano le immagini originali: ogni posa ha la propria finestra alpha in `mascot-frames.js`, condivisa da home e gioco, per escludere frammenti delle righe adiacenti. La marmotta SVG conserva le pose originali. Non trasformare queste finestre in nuovi asset o ridisegni.

L’avvio segue microfono → silenzio facoltativo di cinque secondi → classe; gli accessi successivi usano il passo rapido. Ogni passo mostra una CTA e solo la riga secondaria pertinente: microfono «Prova senza microfono»; silenzio «Indietro» e «Salta»; classe «Indietro»; rapido «Rifai il setup». Durante la misura i secondari sono nascosti. Nessun riepilogo soglie visibile e nessuna pila di opzioni nel wizard. Le impostazioni restano nella toolbar. Preparazione, passaggi e avvio non ricaricano il gioco; XP, energia e pazienza restano sospesi finché non si parte.

## Do's and Don'ts

### Do:
- **Do** usare palette, marchio e Outfit condivisi da home, avvio e gioco.
- **Do** riusare le mascotte originali e le finestre alpha specifiche di ogni posa.
- **Do** mantenere sincronizzati nome e personaggio, con il tratto a mano sul nome.
- **Do** offrire pausa, focus visibile e rispetto del movimento ridotto.
- **Do** conservare una CTA e una sola riga secondaria pertinente per passo del wizard.
- **Do** accompagnare i colori di stato con testo leggibile e segnali della scena.
- **Do** verificare la cascata finale prima di riusare regole dei fogli ereditati.

### Don't:
- **Don't** introdurre reinterpretazioni delle mascotte o cambiare il volto del marchio.
- **Don't** ripristinare Bungee/Atkinson, i vecchi accenti viola o la vecchia carta di avvio come sistema corrente.
- **Don't** aggiungere controlli visibili per il cambio manuale delle mascotte nella home.
- **Don't** sottolineare i secondari del wizard o aggiungere riepiloghi soglie e pile di link.
- **Don't** ridurre le misure principali alla scala dei testi secondari.
- **Don't** confondere l’energia della lezione con gli XP cumulativi.
- **Don't** richiedere font, icone o immagini da servizi esterni per riprodurre questo sistema.
