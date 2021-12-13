export class Game {
    /**
     * L'id del gioco.
     */
    id: Number;
    /**
     * Il nome del gioco.
     */
    name: String;
    /**
     * Il regolamento del gioco.
     */
    regulation: String;
    /**
     * La modalità di gioco: può essere a turni o normale (non a turni).
     */
    type: String;
    /**
     * Minimo numero dei giocatori richiesti.
     */
    minPlayers: Number;
    /**
     * Massimo numero di giocatori ammessi.
     */
    maxPlayers: Number;
    /**
     * Stato del gioco: se attivo è visibile a tutti i giocatori, altrimenti è nascosto.
     */
    isActive: boolean;
    /**
     * L'URL al quale si viene reindirizzati quando si gioca.
     */
    url: String;
    /**
     * JSON di configurazione del funzionamento del gioco.
     */
    config: any;

    constructor(id: Number, name: String, type: String, minPlayers: Number, maxPlayers: Number, url: String) {
        this.id = id;
        this.name = name;
        this.regulation = "";
        this.type = type;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.isActive = true;
        this.url = url;
        this.config = { name: this.name };
    }

    setRegulation(regulation: String) {
        this.regulation = regulation;
    }

    getJSON() {
        var json: any = {};
        json.id = this.id;
        json.name = this.name;
        json.regulation = this.regulation;
        json.type = this.type;
        json.minPlayers = this.minPlayers;
        json.maxPlayers = this.maxPlayers;
        json.isActive = this.isActive;
        json.url = this.url;
        json.config = this.config;
        return json;
    }
}