import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoadingController } from '@ionic/angular';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { Router } from '@angular/router';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-lobby-admin',
  templateUrl: './lobby-admin.page.html',
  styleUrls: ['./lobby-admin.page.scss'],
})
export class LobbyAdminPage implements OnInit, OnDestroy {
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };
  giocatori = [];
  mostraInfoLobby = false;
  mostraInfoGioco = false;
  impossibileCopiareLink = false;
  link;
  redirectPath: string;

  private timerPing;
  private workerPing = new Worker(new URL('src/app/workers/timer-worker.worker', import.meta.url));

  /**
   * Variabile booleana per indicare se l'utente sta uscendo dalla pagina o no:
   * * **true** se l'utente sta uscendo dalla pagina
   * * **false** altrimenti
   */
  isLeavingPage: boolean;

  constructor(
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private lobbyManager: LobbyManagerService,
    private timerController: TimerController,
    private loginService: LoginService,
    private router: Router
  ) {
    window.addEventListener('beforeunload', this.beforeUnloadListener);

    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente) {
          if (tipoUtente == 'ADMIN') this.redirectPath = '/admin/dashboard';
          else this.redirectPath = '/player/dashboard';
        }
      }
    );
  }

  ngOnInit() {
    this.isLeavingPage = false;
    this.initializeTimers();

    setTimeout(() => {
      this.loadInfoLobby();
      this.loadGiocatori();
      this.ping();
    }, 0);
  }

  ngOnDestroy(): void {
    this.isLeavingPage = true;
    this.stopTimers();
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
  }

  beforeUnloadListener = (event) => {
    event.preventDefault();
    return event.returnValue = "Sei sicuro di voler uscire dal sito?";
  };

  /**
   * Inizializza i timer della pagina.
   */
  private initializeTimers() {
    if (typeof Worker !== 'undefined') {
      this.workerPing.onmessage = () => { this.ping(); };
      this.workerPing.postMessage(4000);
    } else {
      // Gli Web Worker non sono supportati.
      this.timerPing = this.timerController.getTimer(() => { this.ping() }, 4000);
    }
  }

  /**
   * Ferma i timer della pagina
   */
  private stopTimers() {
    this.workerPing.terminate();
    this.timerController.stopTimers(this.timerPing);
  }

  /**
   * Gestisce un errore causato da una chiamata REST e crea un alert 
   * solo se l'utente non sta abbandonando la pagina. 
   * @param res Response della chiamata REST
   * @param errorText Header dell'alert
   */
  private handleError(res, errorText: string) {
    if (!this.isLeavingPage) {
      this.stopTimers();
      this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
      this.errorManager.stampaErrore(res, errorText);
      this.isLeavingPage = true;
    }
  }

  /**
   * Cambia il valore di 'mostraInfoLobby' che determina l'espansione della relativa card
   */
  espandiInfoLobby() {
    this.mostraInfoLobby = !this.mostraInfoLobby;
  }

  /**
   * Cambia il valore di 'mostraInfoGioco' che determina l'espansione della relativa card
   */
  espandiInfoGioco() {
    this.mostraInfoGioco = !this.mostraInfoGioco;
  }

  /**
   * Carica le Informazioni della Lobby, se l'Utente corrente non corrisponde
   * all'Admin della Lobby allora viene reinderizzato alla pagina "/lobby-guest".
   */
  private async loadInfoLobby() {
    const tokenValue = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(tokenValue);

    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];

        if (this.lobby.admin_lobby != decodedToken.username) {
          this.stopTimers();
          this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
        }
      },
      async (res) => { this.handleError(res, 'Impossibile caricare la lobby!'); });
  }

  /**
   * Carica i Partecipanti alla Lobby.
   */
  private async loadGiocatori() {
    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
      },
      async (res) => { this.handleError(res, 'Impossibile caricare la lobby!'); });
  }

  /**
   * Modifica lo stato (Pubblica o Privata) della Lobby.
   */
  async modificaLobby() {
    const loading = await this.loadingController.create();
    await loading.present();

    (await this.lobbyManager.modificaLobby(this.lobby.pubblica)).subscribe(
      async (res) => {
        this.loadInfoLobby();
        await loading.dismiss();
        this.alertCreator.createInfoAlert("Lobby aggiornata", "Lo stato della lobby è stato aggiornato.");
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica fallita');
      }
    );
  }

  /**
   * Espelle un Giocatore dalla Lobby.
   * @param username Username del Giocatore da espellere
   * @param index Indice del Giocatore da espellere
   */
  async eliminaPartecipante(username, index) {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler espellere il giocatore selezionato?',
      async () => {
        (await this.lobbyManager.eliminaPartecipante(username)).subscribe(
          async (res) => {
            this.giocatori.splice(index, 1);
            this.alertCreator.createInfoAlert("Partecipante eliminato", "Il giocatore " + username + " è stato rimosso.");
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Eliminazione fallita');
          }
        );
      })
  }

  /**
   * Abbandona la Lobby.
   */
  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        this.stopTimers();
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => { this.router.navigateByUrl(this.redirectPath, { replaceUrl: true }); },
          async (res) => {
            this.initializeTimers();
            this.errorManager.stampaErrore(res, 'Abbandono fallito');
          }
        );
      })
  }

  /**
   * Esegue l'operazione di Ping per segnalare al Server
   * che è ancora presente all'interno della Lobby.
   */
  private async ping() {
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { this.loadGiocatori(); },
      async (res) => { this.handleError(res, 'Ping fallito'); }
    );
  }

  /**
   * Inizia una nuova Partita e viene reinderizzato alla pagina del Gioco .
   */
  async iniziaPartita() {
    (await this.lobbyManager.iniziaPartita()).subscribe(
      async (res) => {
        this.stopTimers();
        this.router.navigateByUrl(this.lobby.link, { replaceUrl: true });
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile iniziare la partita!');
      });
  }

  /**
   * Crea il link per partecipare alla lobby e lo copia nella ClipBoard.
   */
  generaLink() {
    var linkTotale = window.location.href;
    var linkCurrentURL = this.router.url;
    var newLink = linkTotale.replace(linkCurrentURL, '/lobby/join');

    this.link = newLink + "?codiceLobby=" + this.lobby.codice;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.link).then(
        () => {
          this.alertCreator.createInfoAlert("Link copiato", "Il link è stato copiato correttamente, invialo agli altri giocatori!");
        })
        .catch(
          () => {
            this.alertCreator.createInfoAlert("Errore", "Non è stato possibile copiare il link!");
          });
    } else this.impossibileCopiareLink = true;
  }
}