---
name: Ronf
description: "Un mondo alpino giocoso, con una mascotte che dorme e un tabellone leggibile dalla LIM."
colors:
  forest: "#233f38"
  forest-hover: "#345d48"
  forest-board-hover: "#2f554b"
  forest-start: "#315942"
  paper-landing: "#f0f3e9"
  paper-board: "#e7efe3"
  text-board: "#1d2a2c"
  muted-landing: "#4d6255"
  muted-board: "#56656a"
  line-landing: "#c8d3c1"
  line-board: "#d3dbd0"
  white: "#ffffff"
  surface-hud: "#f7faf6"
  surface-welcome: "#f7faf2"
  surface-source: "#e2e9da"
  surface-score: "#f8f5ff"
  score-ink: "#3e285d"
  night-landing: "#1d2b46"
  night-board: "#1b2850"
  violet-landing: "#5d3c7d"
  violet-board: "#6d4aa3"
  violet-focus: "#8154aa"
  lavender: "#e3d6ed"
  moon: "#f1d17b"
  xp-gold: "#f3d582"
  calm: "#2e8b57"
  calm-label: "#246c43"
  warning: "#e3a008"
  alert: "#d63a2c"
  warning-paper: "#f6ebcb"
  alert-paper: "#f4d6cf"
typography:
  display:
    fontFamily: "Bungee, Atkinson, sans-serif"
    fontSize: "clamp(2.5rem, 4.8vw, 4.8rem)"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bungee, Atkinson, sans-serif"
    fontSize: "clamp(1.7rem, 2.8vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  welcome-title:
    fontFamily: "Bungee, Atkinson Hyperlegible, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  body-landing:
    fontFamily: "Atkinson, Arial, sans-serif"
    fontSize: "1.1rem"
    lineHeight: 1.6
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
  action-landing: "12px"
  card-landing: "14px"
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
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.action-landing}"
    padding: "1.25rem 1.6rem"
  button-landing-hover:
    backgroundColor: "{colors.forest-hover}"
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
  habitat:
    backgroundColor: "{colors.night-landing}"
    rounded: "48% 48% 14px 14px"
  card-welcome:
    backgroundColor: "{colors.surface-welcome}"
    rounded: "{rounded.panel}"
    padding: "2.2rem 2.4rem 1.8rem"
---

# Design System: Ronf

## Overview

**Creative North Star: "Il rifugio della marmotta"**

Ronf porta in aula un piccolo paesaggio alpino: carta chiara, verde bosco, cielo notturno e una mascotte che dorme. Il tono è giocoso e diretto. La scena e i caratteri grandi danno identità; i testi e i controlli rimangono leggibili e concreti.

Il sistema preserva il tabellone e le mascotte già esistenti. La composizione cambia fra le superfici: la presentazione lascia spazio al titolo e al personaggio, mentre il gioco concentra scena, misure e progressi in un tabellone per la LIM. La strategia delle singole pagine è registrata in `.impeccable/surfaces.md`.

**Key Characteristics:**
- Paesaggio alpino e mascotte come elementi riconoscibili.
- Verde bosco e carte pallide per testi e controlli.
- Bungee per identità, titoli e grandi numeri; Atkinson per leggere e agire.
- Viola circoscritto ai progressi, alla combo e al focus.
- Stato comunicato con colore, testo e cambiamento della scena.

Rilevato dal codice il 28 ottobre 2026. Fonti: `landing.css`; per il gioco, cascata `board.css` → `lesson-board.css` → `ronf.css`; elementi verificati in `index.html` e `gioca.html`. Questo documento descrive l'implementazione corrente, senza introdurre un nuovo redesign.

## Colors

La palette accosta bosco e carta a un cielo blu; i colori di segnale e di progressione hanno compiti distinti. I valori normativi sono nel frontmatter.

### Primary
- **Bosco** (`forest`): testo dominante e azione principale della presentazione; bordi, selezioni e pulsanti principali del gioco. Le varianti hover distinguono i due contesti; l'avvio del microfono usa `forest-start`.

### Secondary
- **Notte alpina** (`night-landing`, `night-board`): campo della scena e contrasto dietro la mascotte. Il tabellone passa fra notte, alba, giorno e allarme attraverso le sue sfumature illustrate.
- **Viola dei progressi** (`violet-landing`, `violet-board`, `surface-score`, `score-ink`): piccoli segni del marchio, combo e pannello del punteggio. `violet-focus` identifica il focus nel gioco.
- **Luna e XP** (`moon`, `xp-gold`): luce della scena e totale XP; non sostituiscono i colori del livello sonoro.

### Tertiary
- **Calma** (`calm`, `calm-label`): livello sonoro favorevole, barra e indicatore testuale. Il pill favorevole usa il verde più scuro per il testo bianco.
- **Attenzione** (`warning`, `warning-paper`): avvicinamento alla soglia e stato intermedio; il pill usa testo scuro.
- **Allarme** (`alert`, `alert-paper`): soglia superata e azioni distruttive. Il relativo stato cambia anche messaggio e scena.

### Neutral
- **Carta della presentazione** (`paper-landing`): fondo chiaro leggermente verde.
- **Carta del tabellone** (`paper-board`): fondo del gioco in calma; cambia tonalità con lo stato sonoro.
- **Bianco e carte funzionali** (`white`, `surface-hud`, `surface-welcome`, `surface-source`): controlli, misure, avvio e blocco del codice pubblico.
- **Inchiostro del tabellone** (`text-board`): testo corrente del gioco. Il bosco svolge questo ruolo nella presentazione.
- **Testo secondario e righe** (`muted-landing`, `muted-board`, `line-landing`, `line-board`): spiegazioni, separatori e bordi discreti. `lavender` compare nella selezione del testo della presentazione.

**The State Has Words Rule.** Ogni stato sonoro conserva un nome leggibile e un riscontro nella scena; il colore da solo non comunica il significato.

## Typography

**Display Font:** Bungee, con i fallback della superficie.
**Body Font:** Atkinson Hyperlegible, registrato come `Atkinson` nella presentazione e come `Atkinson Hyperlegible` nel gioco. Sono gli stessi file locali, nei pesi regolare e grassetto.

Il titolo è compatto, vistoso e giocoso; i testi mantengono forme aperte e un'interlinea generosa. I font sono distribuiti dal sito, senza richieste a servizi di font esterni.

### Hierarchy
- **Display** (`display`): titolo principale della presentazione; larghezza limitata a (13ch) per una lettura in poche righe. Le variazioni mobile sono nella sezione Layout.
- **Headline** (`headline`): sezioni della presentazione. Il titolo di avvio del gioco ha il ruolo separato `welcome-title`.
- **Body** (`body-landing`, `body-board`): testo descrittivo e interfaccia; la descrizione principale della presentazione arriva a (43ch), i testi lunghi del gioco a circa (68ch).
- **Label** (`label-board`): etichette di misure e punteggi sul tabellone. Le etichette secondarie possono essere più piccole, ma non sostituiscono quelle principali.
- **Readout** (`readout`): livello sonoro nel pannello. I grandi numeri della combo e del punteggio hanno scala propria e numeri tabulari.

**The Room First Rule.** Sul tabellone conservare la gerarchia fra numero grande, nome della misura e spiegazione secondaria: deve funzionare per chi guarda dalla classe.

## Layout

La presentazione usa un contenitore massimo di (1440px) e margini laterali fluidi (`clamp(1.2rem, 5vw, 5rem)`). L'apertura ha due colonne in rapporto (1.36:1), con titolo e azione a sinistra e scena a destra. A (1000px) si compatta; a (700px) diventa una colonna. Il titolo mobile usa `clamp(2.2rem, 7.8vw, 3.5rem)` e l'azione occupa la larghezza disponibile. Oltre (1600px) il titolo arriva a (5rem).

Il tabellone usa un rem che cresce con lo schermo (`clamp(14px, calc(.62vw + .55vh), 26px)`) e `board-gap` fra le regioni. La scena contiene mascotte al centro, livello/XP in alto a sinistra, misure a destra, punteggio e combo in basso. Storico ed energia della lezione occupano la regione inferiore. Con larghezza oltre (1100px) e altezza da (700px), l'app usa l'altezza del viewport; sotto (1100px) scorre verticalmente.

Sul telefono, entro (620px), il gioco mantiene una scena alta e dispone le due misure affiancate sopra al punteggio. L'ultimo override in `ronf.css` porta la scena a un minimo di (49rem) e la toolbar a una griglia di due colonne, con l'ultimo pulsante esteso su entrambe. I testi dei pulsanti possono andare a capo. La schermata di avvio impila i comandi a tutta larghezza. Le regole finali prevalgono sulle toolbar precedenti nei fogli ereditati.

## Elevation & Depth

Il tabellone usa soprattutto campi di colore, bordi e livelli della scena. La scena corrente non ha ombra. Le ombre funzionali emergono su dialoghi, avvio e promemoria; l'azione della presentazione ha un'ombra morbida contenuta. Non applicare alle nuove superfici le vecchie ombre del palco superate dalla cascata attuale.

### Shadow Vocabulary
- **Azione della presentazione:** `0 5px 14px rgba(20,38,30,.12)`; accompagna l'azione grande.
- **Avvio:** `0 12px 46px rgba(10,27,24,.26)`; stacca la carta dal fondale scuro.
- **Dialogo:** `8px 8px 0 var(--forest)`; ombra netta già usata nelle impostazioni.
- **Cambio ora:** `0 8px 32px rgba(10,27,24,.25)`; eleva il promemoria.
- **Premio raggiunto:** `0 3px 0 #aa7218`; rende tattile la medaglia attivata.

## Shapes

Le carte principali hanno angoli morbidi, con pannelli e avvio a `panel` e misure a `hud`. I controlli usano `control`; i selettori compatti usano `field-compact`. Chip di classe, pill di stato e barre di progressione hanno estremità rotonde.

La scena della presentazione è una nicchia con sommità arcuata (`48% 48% 14px 14px`), più larga su mobile (`45% 45% 14px 14px`). Il tabellone mantiene invece un rettangolo arrotondato delimitato da un bordo bosco di (2px). Medaglie circolari e stemma a scudo identificano premi e livello.

## Components

### Buttons

Comandi grandi e inequivocabili, con etichetta in grassetto.

- **Presentazione:** `button-landing`, altezza minima (90px), testo fluido (`clamp(1.45rem, 2.2vw, 1.9rem)`), icona e freccia. Hover con sollevamento di (2px) e transizione di (.18s); mobile almeno (82px).
- **Gioco:** `button-primary` e `button-secondary`, bordo bosco di (1.5px), testo (.9rem). Hover con cambio di fondo; pressione con spostamento di (1px). L'avvio usa controlli più alti e il verde `forest-start` per il microfono.
- **Azioni distruttive:** bordo rosso e testo rosso scuro; la variante armata diventa rossa con testo bianco. Non usarla per le azioni quotidiane.
- **Focus:** contorno visibile di (3px); offset di (6px) sui link della presentazione e (3px) sui controlli del gioco.
- **Disabilitato:** opacità (.55) e cursore normale.

### Chips

La classe è un pill con bordo bosco, fondo bianco e nome in grassetto. La selezione riempie il pill di bosco con testo bianco e conserva `aria-pressed`. Il chip della simulazione ha bordo viola tratteggiato: deve restare riconoscibile come modalità distinta.

### Cards / Containers

Le misure appaiono su carta `surface-hud`, con bordo verde tenue di (1px), angoli `hud` e spazio interno di `card-hud`. Il punteggio usa `surface-score` e testo viola scuro, separando i due gruppi con una linea. Il contenitore di avvio usa `surface-welcome` e la relativa ombra. Lo storico ha fondo bosco scuro e testo chiaro; i premi rimangono su fondo bianco.

### Inputs / Fields

Campo bianco, bordo verde grigio di (1.5px), angoli `control`, etichetta in grassetto e spazio verticale di (.4rem). Il textarea ha angoli `field-compact` e bordo di (1px). Range e checkbox usano il bosco; i range mostrano il valore con un output testuale. Focus viola condiviso con i pulsanti.

### Navigation

La presentazione ha marchio Bungee a sinistra e link testuali a destra, con icona GitHub e nome visibile. Su mobile il link informativo viene nascosto, mentre GitHub rimane. Il marchio `Ronf` conserva il piccolo `zz` inclinato. La testata del gioco usa il marchio come ritorno all'avvio e mantiene i comandi operativi raggruppati.

### Habitat and board

La mascotte deve restare protagonista della scena. Notte, alba, giorno e allarme descrivono i suoi stati. La didascalia della scena della presentazione ha fondo notturno pieno e spazio interno: non appoggiare il testo sulle montagne. Sul tabellone energia della lezione e XP restano visivamente distinti, con una combo circolare e grandi letture numeriche.

Le animazioni del gioco descrivono respiro, cambi di stato e traguardi. `prefers-reduced-motion` elimina animazioni e transizioni, compresi movimento dell'azione e scorrimento morbido della presentazione; i coriandoli non vengono mostrati.

## Do's and Don'ts

### Do:
- **Do** conservare paesaggio alpino, mascotte e accoppiata Bungee/Atkinson.
- **Do** usare il bosco per azioni e controlli, mantenendo il viola legato a progressi e focus.
- **Do** accompagnare i colori di stato con testo leggibile e segnali della scena.
- **Do** verificare la cascata finale prima di riusare una regola dei fogli ereditati.
- **Do** mantenere focus visibile, etichette dei campi e rispetto del movimento ridotto.

### Don't:
- **Don't** ridurre le misure principali alla scala dei testi secondari.
- **Don't** confondere l'energia della lezione con gli XP cumulativi.
- **Don't** sovrapporre didascalie chiare al paesaggio senza il fondo notturno pieno.
- **Don't** ripristinare le vecchie ombre del palco o le vecchie toolbar ignorando gli override correnti.
- **Don't** richiedere font, icone o immagini da servizi esterni per riprodurre questo sistema.
