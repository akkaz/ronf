---
name: Ronf
description: "Una marmotta originale, una landing lime e un tabellone alpino leggibile dalla LIM."
colors:
  lime-landing: "#eaf17f"
  ink-landing: "#173c32"
  ink-landing-hover: "#2e5545"
  cream-landing: "#fffdf3"
  selection-landing: "#f4ad8b"
  forest: "#233f38"
  forest-board-hover: "#2f554b"
  forest-start: "#315942"
  paper-board: "#e7efe3"
  text-board: "#1d2a2c"
  muted-board: "#56656a"
  line-board: "#d3dbd0"
  white: "#ffffff"
  surface-hud: "#f7faf6"
  surface-welcome: "#f7faf2"
  surface-score: "#f8f5ff"
  score-ink: "#3e285d"
  night-board: "#1b2850"
  violet-board: "#6d4aa3"
  violet-focus: "#8154aa"
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
  brand-landing:
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
    fontFamily: "Bungee, Atkinson Hyperlegible, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  body-board:
    fontFamily: "Atkinson Hyperlegible, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.45
  label-board:
    fontFamily: "Atkinson Hyperlegible, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
  readout:
    fontFamily: "Bungee, Arial Black, Impact, sans-serif"
    fontSize: "3.5rem"
    lineHeight: 1
rounded:
  field-compact: "0.5rem"
  control: "0.6rem"
  hud: "0.8rem"
  panel: "1rem"
  dialog: "1.1rem"
  action-landing: "10px"
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
    backgroundColor: "{colors.ink-landing}"
    textColor: "{colors.cream-landing}"
    typography: "{typography.label-landing}"
    rounded: "{rounded.action-landing}"
    padding: "0.9rem 1.25rem"
    height: "54px"
  button-landing-hover:
    backgroundColor: "{colors.ink-landing-hover}"
  button-landing-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-landing}"
    typography: "{typography.label-landing}"
    rounded: "{rounded.action-landing}"
    padding: "0.9rem 1.25rem"
    height: "54px"
  button-landing-secondary-hover:
    backgroundColor: "{colors.cream-landing}"
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
  button-primary-hover:
    backgroundColor: "{colors.forest-board-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-board}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
  button-danger:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0.42rem 0.85rem"
  input-text:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-board}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.65rem"
  chip-class:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-board}"
    rounded: "{rounded.pill}"
    padding: "0.28rem 0.85rem"
  chip-class-selected:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
  card-hud:
    backgroundColor: "{colors.surface-hud}"
    rounded: "{rounded.hud}"
    padding: "0.9rem 1rem"
  card-welcome:
    backgroundColor: "{colors.surface-welcome}"
    rounded: "{rounded.panel}"
    padding: "2.2rem 2.4rem 1.8rem"
---

# Design System: Ronf

## Overview

**Creative North Star: "Il rifugio della marmotta"**

La marmotta originale lega due registri di Ronf: un ingresso lime, grande e ironico, e un tabellone alpino con misure leggibili dalla LIM. La landing usa inchiostro verde scuro, lettere Outfit pesanti e una piccola annotazione Caveat; il gioco conserva carta chiara, verde bosco, cielo notturno e l’accoppiata Bungee/Atkinson.

Il personaggio resta identico fra le superfici. La sua faccia addormentata diventa anche il piccolo marchio della landing, senza ridisegnare la mascotte. La composizione cambia secondo l’uso: invito e apertura del gioco nella presentazione, scena e controlli operativi nel tabellone. Le scelte della singola pagina sono registrate in `.impeccable/surfaces/index-html.md` e `.impeccable/surfaces.md`.

**Key Characteristics:**
- Marmotta originale come elemento riconoscibile comune.
- Lime e inchiostro verde scuro per la landing, senza ombre o animazioni.
- Outfit per titolo, marchio e testi della landing; Caveat per il solo «sssh.».
- Paesaggio alpino, Bungee e Atkinson preservati nel gioco.
- Viola circoscritto ai progressi, alla combo e al focus del gioco.
- Stato comunicato con colore, testo e cambiamento della scena.

Rilevato dal codice il 28 ottobre 2026 dopo il redesign A1 approvato. Fonti della landing: `index.html`, `landing.css` e `assets/ronf-mark.svg`; per il gioco, cascata `board.css` → `lesson-board.css` → `ronf.css` ed elementi di `gioca.html`. La documentazione aggiorna la landing e conserva il sistema del gioco.

## Colors

La landing mette la marmotta su un campo lime uniforme; il tabellone mantiene bosco, carta e cielo blu. I colori di segnale e progressione del gioco conservano compiti distinti. I valori normativi sono nel frontmatter.

### Primary
- **Inchiostro della landing** (`ink-landing`): titolo, testo, marchio, bordo dei pulsanti e riempimento dell’azione principale. `ink-landing-hover` è il suo stato hover.
- **Bosco del gioco** (`forest`): bordi, selezioni e pulsanti principali del tabellone. `forest-board-hover` ne definisce l’hover; l’avvio del microfono usa `forest-start`.

### Secondary
- **Lime della landing** (`lime-landing`): unico fondo di testata, contenuto e footer, senza pannelli o paesaggio aggiunto.
- **Notte alpina** (`night-board`): campo della scena e contrasto dietro la mascotte del gioco. Il tabellone passa fra notte, alba, giorno e allarme attraverso le sue sfumature illustrate.
- **Viola dei progressi** (`violet-board`, `surface-score`, `score-ink`): combo e pannello del punteggio. `violet-focus` identifica il focus nel gioco.
- **Oro XP** (`xp-gold`): totale XP; non sostituisce i colori del livello sonoro.

### Tertiary
- **Calma** (`calm`, `calm-label`): livello sonoro favorevole, barra e indicatore testuale. Il pill favorevole usa il verde più scuro per il testo bianco.
- **Attenzione** (`warning`, `warning-paper`): avvicinamento alla soglia e stato intermedio; il pill usa testo scuro.
- **Allarme** (`alert`, `alert-paper`): soglia superata e azioni distruttive. Il relativo stato cambia anche messaggio e scena.

### Neutral
- **Crema della landing** (`cream-landing`): testo del pulsante pieno e fondo hover del secondario.
- **Pesca della selezione** (`selection-landing`): evidenziazione del testo selezionato nella landing, con inchiostro verde scuro.
- **Carta del tabellone** (`paper-board`): fondo del gioco in calma; cambia tonalità con lo stato sonoro.
- **Bianco e carte funzionali** (`white`, `surface-hud`, `surface-welcome`): controlli, misure e avvio del gioco.
- **Inchiostro del tabellone** (`text-board`): testo corrente del gioco.
- **Testo secondario e righe del gioco** (`muted-board`, `line-board`): spiegazioni, separatori e bordi discreti.

**The State Has Words Rule.** Ogni stato sonoro conserva un nome leggibile e un riscontro nella scena; il colore da solo non comunica il significato.

## Typography

**Landing:** Outfit variabile, con fallback sans-serif, per marchio, titolo, testi e azioni. Caveat variabile, con fallback sans-serif, compare solo nell’annotazione «sssh.».
**Gioco:** Bungee per identità, titoli e grandi numeri; Atkinson Hyperlegible per leggere e agire, nei pesi regolare e grassetto.

Il titolo della landing è largo, pesante e serrato; il gioco mantiene forme aperte e gerarchie leggibili da lontano. Tutti i font sono distribuiti dal sito, senza richieste a servizi di font esterni.

### Hierarchy
- **Display** (`display`): titolo della landing, peso (900), massimo (13ch), con interlinea quasi compatta. Entro (700px) usa `clamp(2.8rem, 11.4vw, 4.5rem)`. L’emoji 🤫 è parte del titolo esplicitamente scelto dall’autore e ha nome accessibile; non è un’icona generica dei controlli.
- **Marchio** (`brand-landing`): Ronf in Outfit, accanto al volto originale addormentato. Entro (700px) il nome scende a (1.8rem).
- **Body della landing** (`body-landing`): descrizione in due blocchi, larga al massimo (35ch). Entro (700px) passa a (1.06rem) e (34ch).
- **Label della landing** (`label-landing`): le due azioni condividono peso, dimensione e interlinea. Gratuità e firma hanno scala più discreta.
- **Annotazione** (`annotation-landing`): «sssh.» in Caveat, inclinato staticamente di (9deg). Sotto (900px) usa (3rem).
- **Titolo di avvio** (`welcome-title`): Bungee sulla carta di ingresso al gioco.
- **Body del gioco** (`body-board`): interfaccia operativa e dialoghi. I testi lunghi arrivano a circa (68ch).
- **Label del gioco** (`label-board`): etichette di misure e punteggi sul tabellone. Le etichette secondarie possono essere più piccole, ma non sostituiscono quelle principali.
- **Readout** (`readout`): livello sonoro nel pannello. I grandi numeri della combo e del punteggio hanno scala propria e numeri tabulari.

**The Room First Rule.** Sul tabellone conservare la gerarchia fra numero grande, nome della misura e spiegazione secondaria: deve funzionare per chi guarda dalla classe.

## Layout

La landing ha un contenitore largo al massimo (1440px), alto almeno `100svh`, con margini interni orizzontali di (5vw). Testata e footer delimitano un’area principale flessibile: la griglia a due colonne, nel rapporto (1.3fr / 1fr), centra verticalmente testo e mascotte nello spazio disponibile. Il gap è (3rem), ridotto a (1rem) entro (900px). La marmotta riempie la sua colonna mantenendo il rapporto originale; non è confinata in una carta.

Entro (700px) la landing usa una colonna con margini di (6vw), testo e azioni prima della mascotte, gap di (2rem) e scorrimento naturale. La figura arriva a un massimo di (310px), allineata a destra. Le azioni possono andare a capo; il gruppo è largo al massimo (360px), con gap di (.75rem) e base flessibile di (150px) per pulsante. Il footer passa a una griglia verticale.

Il tabellone usa un rem che cresce con lo schermo (`clamp(14px, calc(.62vw + .55vh), 26px)`) e `board-gap` fra le regioni. La scena contiene mascotte al centro, livello/XP in alto a sinistra, misure a destra, punteggio e combo in basso. Storico ed energia della lezione occupano la regione inferiore. Con larghezza oltre (1100px) e altezza da (700px), l’app usa l’altezza del viewport; sotto (1100px) scorre verticalmente.

Sul telefono, entro (620px), il gioco mantiene una scena alta e dispone le due misure affiancate sopra al punteggio. L’ultimo override in `ronf.css` porta la scena a un minimo di (49rem) e la toolbar a una griglia di due colonne, con l’ultimo pulsante esteso su entrambe. I testi dei pulsanti possono andare a capo. La schermata di avvio impila i comandi a tutta larghezza. Le regole finali prevalgono sulle toolbar precedenti nei fogli ereditati.

## Elevation & Depth

La landing è piatta: campo lime, testo, pulsanti e mascotte senza ombre CSS, carte o effetti di profondità aggiunti. L’ombra illustrata appartiene al file originale della marmotta. Nessuna animazione o transizione è definita nella landing; gli hover cambiano direttamente il colore.

Il tabellone usa soprattutto campi di colore, bordi e livelli della scena. La scena corrente non ha ombra. Le ombre funzionali emergono su dialoghi, avvio e promemoria.

### Shadow Vocabulary
- **Avvio:** `0 12px 46px rgba(10,27,24,.26)`; stacca la carta dal fondale scuro.
- **Dialogo:** `8px 8px 0 var(--forest)`; ombra netta già usata nelle impostazioni.
- **Cambio ora:** `0 8px 32px rgba(10,27,24,.25)`; eleva il promemoria.
- **Premio raggiunto:** `0 3px 0 #aa7218`; rende tattile la medaglia attivata.

## Shapes

I pulsanti della landing hanno angoli morbidi (`action-landing`) e bordo continuo di (1.5px). Il marchio riprende il volto della mascotte senza un contenitore aggiunto; la figura grande conserva tutta la sagoma originale.

Nel gioco le carte principali hanno angoli morbidi, con pannelli e avvio a `panel` e misure a `hud`. I controlli usano `control`; i selettori compatti usano `field-compact`. Chip di classe, pill di stato e barre di progressione hanno estremità rotonde. Il tabellone mantiene un rettangolo arrotondato delimitato da un bordo bosco di (2px). Medaglie circolari e stemma a scudo identificano premi e livello.

## Components

### Buttons

Azioni della landing affiancate e comandi del gioco chiaramente distinguibili.

- **Apri Ronf:** `button-landing`, altezza minima (54px), fondo inchiostro e testo crema, con freccia SVG. Apre `gioca.html` nella stessa scheda. Hover con il verde dedicato, senza movimento.
- **GitHub:** `button-landing-secondary`, stessa altezza e tipografia, fondo trasparente e bordo inchiostro. Icona GitHub originale e nome visibile; hover crema. Apre il repository pubblico in una nuova scheda.
- **Gioco:** `button-primary` e `button-secondary`, bordo bosco di (1.5px), testo (.9rem). Hover con cambio di fondo; pressione con spostamento di (1px). L’avvio usa controlli più alti e il verde `forest-start` per il microfono.
- **Azioni distruttive:** bordo rosso e testo rosso scuro; la variante armata diventa rossa con testo bianco. Non usarla per le azioni quotidiane.
- **Focus:** contorno visibile di (3px); nella landing usa il colore corrente e offset di (6px), nel gioco viola e offset di (3px). Lo skip link della landing compare al focus e porta all’azione principale.
- **Disabilitato nel gioco:** opacità (.55) e cursore normale.

### Chips

La classe è un pill con bordo bosco, fondo bianco e nome in grassetto. La selezione riempie il pill di bosco con testo bianco e conserva `aria-pressed`. Il chip della simulazione ha bordo viola tratteggiato: deve restare riconoscibile come modalità distinta.

### Cards / Containers

Le misure del gioco appaiono su carta `surface-hud`, con bordo verde tenue di (1px), angoli `hud` e spazio interno di `card-hud`. Il punteggio usa `surface-score` e testo viola scuro, separando i due gruppi con una linea. Il contenitore di avvio usa `surface-welcome` e la relativa ombra. Lo storico ha fondo bosco scuro e testo chiaro; i premi rimangono su fondo bianco.

### Inputs / Fields

Campo bianco, bordo verde grigio di (1.5px), angoli `control`, etichetta in grassetto e spazio verticale di (.4rem). Il textarea ha angoli `field-compact` e bordo di (1px). Range e checkbox usano il bosco; i range mostrano il valore con un output testuale. Focus viola condiviso con i pulsanti.

### Navigation

La testata della landing contiene il volto addormentato originale e il nome Ronf in Outfit con il punto finale. Il volto misura (48 × 42px), ridotti a (40 × 35px) su telefono. Le azioni sono nel contenuto principale; il footer conserva la firma «akkaz» e la nota sull’audio. La testata del gioco mantiene il suo marchio Bungee e i comandi operativi raggruppati.

### Mascot and board

La landing mostra `assets/marmotta.svg` intera e statica; `assets/ronf-mark.svg` ne estrae il volto mantenendo forme e colori originali. Il gioco conserva mascotte e paesaggio: notte, alba, giorno e allarme descrivono i suoi stati. Energia della lezione e XP restano visivamente distinti, con una combo circolare e grandi letture numeriche.

Le animazioni del gioco descrivono respiro, cambi di stato e traguardi. `prefers-reduced-motion` elimina animazioni e transizioni del gioco.

## Do's and Don'ts

### Do:
- **Do** conservare la marmotta originale e usare il suo volto originale per il marchio della landing.
- **Do** usare Outfit e Caveat nella landing e conservare paesaggio alpino e accoppiata Bungee/Atkinson nel gioco.
- **Do** mantenere la landing piatta e statica, con lime, inchiostro verde scuro e crema nei ruoli documentati.
- **Do** usare il bosco per azioni e controlli del gioco, mantenendo il viola legato a progressi e focus.
- **Do** accompagnare i colori di stato con testo leggibile e segnali della scena.
- **Do** verificare la cascata finale prima di riusare una regola dei fogli ereditati.
- **Do** mantenere focus visibile, etichette dei campi e rispetto del movimento ridotto.

### Don't:
- **Don't** ridisegnare la marmotta o sostituire il volto del marchio con un animale diverso.
- **Don't** ridurre le misure principali alla scala dei testi secondari.
- **Don't** confondere l’energia della lezione con gli XP cumulativi.
- **Don't** sovrapporre didascalie chiare al paesaggio senza il fondo notturno pieno.
- **Don't** ripristinare le vecchie ombre del palco o le vecchie toolbar ignorando gli override correnti.
- **Don't** richiedere font, icone o immagini da servizi esterni per riprodurre questo sistema.
