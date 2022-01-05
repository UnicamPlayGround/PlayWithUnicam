<p width="100%">
    <img src="src/assets/images/unicam.png" style="width:30%; float:left">
    <!-- <p style="width:30%; float: right; text-align:right;">a.y. 2020/2021
    </p> -->
</p>

<p style="float: left; text-align:left; width:100%; margin-top:30px;">
    <img src="src/assets/logo_grey.png" style="width:65%; float:left">
</p>

<p style="float: left; text-align:left; width:100%; margin-top:30px; margin-bottom:0px;">
    Authors:
</p>
<h3 style="float: left; text-align:left; width:100%; margin-top:0px;">
    Catervi Tommaso, Cipolletta Leonardo, Rondini Matteo
</h3>

<p style="float: left; text-align:left; width:100%; margin-top:30px;">
    Questo progetto è stato realizzato come elaborato finale per il conseguimento della laurea triennale in Informatica (L-31) presso l<a href="https://www.unicam.it/"><b>'Università di Camerino</b></a>.
</p>

<h1 style="font-weight:bold; float: left; text-align:left; width:100%; margin-top:30px;">Introduzione</h1>
<p style="float: left; text-align:left; width:100%;">
    L'idea alla base del progetto è quella di creare uno strumento didattico alternativo capace di coniugare l'aspetto videoludico e l'apprendimento, basandosi sull'utilizzo dei cosiddetti <i>serious game</i>, ovvero giochi che non hanno come scopo principale l'intrattenimento, ma che sono progettati soprattutto a fini educativi.
</p>

<p style="float: left; text-align:left; width:100%;">
    <b>PlayWithUnicam</b> è un applicativo web che vuole offrire un portale di raccolta di videogiochi della suddetta categoria, dove è possibile creare stanze di gioco (<i>lobby</i>) che consentono agli utenti di connettersi tra loro per giocare assieme ad un determinato gioco.
    Al centro dell'attenzione sta la volontà di creare un'esperienza formativa efficace, piacevole e divertente.
</p>

<h1 style="font-weight:bold; float: left; text-align:left; width:100%; margin-top:30px;">Giochi</h1>
<p style="float: left; text-align:left; width:100%;">
    L'obiettivo è quello di arricchire la piattaforma con giochi di stampo educativo, ciascuno provvisto di un apposito editor che consenta di modificarne il comportamento, la struttura ed i contenuti, rendendolo dunque liberamente personalizzabile e declinando l'esperienza formativa sugli argomenti che si desiderano.
</p>
<p style="float: left; text-align:left; width:100%;">
    Attualmente, il catalogo dei giochi è provvisto dei seguenti giochi:
</p>
<p style="float: left; text-align:left; width:100%; margin-left:30px;">
    <a href="https://it.wikipedia.org/wiki/Gioco_dell%27oca"><b>Gioco dell'oca:</b></a> una versione multiplayer personalizzata del più classico dei giochi da tavolo con tabellone.
</p>
<p style="float: left; text-align:left; width:100%; margin-left:30px;">
    <a href="https://it.wikipedia.org/wiki/Memoria_(gioco)"><b>Memory multiplayer:</b></a> una versione multiplayer del popolare gioco di carte per bambini che richiede concentrazione e memoria, in cui i giocatori devono accoppiare le carte.
</p>
<p style="float: left; text-align:left; width:100%; margin-left:30px;">
    <a href="https://it.wikipedia.org/wiki/Memoria_(gioco)"><b>Memory a schermo condiviso:</b></a> una versione a schermo condiviso del gioco precedentemente menzionato, pensata per scenari didattici in cui si dispone di un unico dispositivo, che consente di creare più giocatori controllabili da un singolo utente.
</p>

<h1 style="font-weight:bold; float: left; text-align:left; width:100%; margin-top:30px;">Architettura della piattaforma</h1>
<p style="float: left; text-align:left; width:100%; margin-bottom:200px !important;">
    Le componenti principali dell'app sono sostanzialmente: 
        * Un front-end sviluppato tramite framework <a href="https://angular.io/"><b>Angular</b></a> e <a href="https://ionicframework.com/"><b>Ionic</b></a>.
        * Un back-end realizzato in	Javascript tramite il framework <a href="https://nodejs.org/it/"><b>Node.js</b></a>.
        * Una <a href="https://it.wikipedia.org/wiki/Representational_state_transfer"><b>API RESTful</b></a> per far dialogare le due parti.
        * Un database relazionale realizzato tramite <a href="https://www.postgresql.org/"><b>PostgreSQL</b></a>.
</p>