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
    private config;

    /**
     * Editor del gioco utilizzato da: {@link GameEditorService}
     */
    private editor: Type<any>;

    constructor(name: string, type: GameType, minPlayers: number, maxPlayers: number, url: string, editor: Type<any>) {
        this.name = name;
        this.type = type;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.url = url
        this.editor = editor;
        this.config = { game_name: name };
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