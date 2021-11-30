# PlayWithUnicam
Piattaforma online per giochi da tavolo multiplayer realizzata come Group Project UNICAM

# Introduzione
L'idea alla base del progetto è quella di creare uno strumento didattico alternativo capace di coniugare l'aspetto videoludico e l'apprendimento, basandosi sull'utilizzo dei cosiddetti **serious games**, ovvero giochi che non hanno come scopo principale l'intrattenimento, ma che sono progettati soprattutto a fini educativi.

L'obiettivo è l'implementazione di una piattaforma online che possa ospitare un catalogo, arricchibile nel tempo, di videogiochi multiplayer della suddetta categoria, studiata in maniera tale da essere facilmente estensibile con nuovi componenti e nuovi giochi declinabili su argomenti differenti (come ad esempio l'informatica).
Al centro dell'attenzione sta la volontà di creare un'esperienza formativa efficace, piacevole e divertente.

Si intende progettare un applicativo web che consenta a più utenti di connettersi e giocare assieme ad un determinato gioco del catalogo, dunque offrendo la possibilità di creare delle *“stanze di gioco” (lobby)* a cui è possibile partecipare con o senza limitazioni per disputare la stessa partita, che potrà poi essere arricchita da una classifica finale.

Abbiamo identificato tre attori principali che interagiranno con la piattaforma:
* **Admin della piattaforma**: amministra la piattaforma e può gestire gli utenti (modificandone i dati o eliminandoli) ed i giochi (modificandone i dati, eliminandoli o aggiungendone di nuovi).
* **Utente ospite**: si autentica nella piattaforma inserendo semplicemente un username e può iniziare subito a giocare. Dispone tuttavia di un account temporaneo.
* **Utente registrato**: a differenza dell’utente ospite può salvare e modificare i propri dati (nome, cognome, username e password).

Un utente che, scelto un determinato  gioco, crea una lobby per poterci giocare, assumerà il ruolo di admin della stessa, guadagnando la facoltà di espellere gli altri partecipanti e modificare la visibilità della stanza scegliendo tra:
* *pubblica*: individuabile da qualunque giocatore autenticato alla piattaforma e caratterizzata da accesso libero.
* *privata*: invisibile agli altri giocatori e accesso consentito solo a chi è a conoscenza del codice univoco della stessa.

# Architettura della piattaforma
Le componenti principali della piattaforma sono sostanzialmente: 

* Un front-end sviluppato tramite framework **Angular** e **Ionic**.
* Un back-end realizzato in	Javascript con **Node.js**.
* Una **API RESTful** per far dialogare le due parti.
* Un database relazionale realizzato tramite **Postgresql**.
