import { Type } from "@angular/core";
import { GameType } from "./game-type";
import { GameEditorService } from "../users/admin/services/game-editor/game-editor.service";

/**
 * Classe che rappresenta i giochi attualmente implementati dalla piattaforma.
 */
export class Game {
    private name: string;
    private type: GameType;
    private minPlayers: number;
    private maxPlayers: number;
    private url: string;
    private config: any = {};

    /**
     * Editor del gioco utilizzato da: {@link GameEditorService}
     */
    private editor: Type<any>;

    /**
     * Costruttore del gioco.
     * @param name Nome univoco del gioco
     * @param type Tipologia del gioco 
     * @param minPlayers Numero minimo di giocatori supportati
     * @param maxPlayers Numero massimo di giocatori supportati
     * @param url Url del gioco
     * @param editor Editor del gioco
     * @param configParams parametri opzionali da aggiungere al JSON di configurazione 
     */
    constructor(name: string, type: GameType, minPlayers: number, maxPlayers: number, url: string, editor: Type<any>, configParams?: any) {
        this.name = name;
        this.type = type;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.url = url
        this.editor = editor;
        if (configParams)
            this.config = configParams;
        this.config.game_name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): string {
        return this.type.valueOf();
    }

    public getMinPlayers(): number {
        return this.minPlayers;
    }

    public getMaxPlayers(): number {
        return this.maxPlayers;
    }

    public getUrl(): string {
        return this.url;
    }

    public getConfig() {
        return this.config;
    }

    public getEditor(): Type<any> {
        return this.editor;
    }

}