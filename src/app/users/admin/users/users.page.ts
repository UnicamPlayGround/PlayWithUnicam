import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EditUserPage } from '../modal-pages/edit-user/edit-user.page';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  page = 0;
  resultsCount = 10;
  totalPages = 10;
  users = [];
  bulkEdit = false;
  edit = {};
  sortDirection = 0;
  sortKey = null;
  maximumPages = 2;

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private alertCreator: AlertCreatorService
  ) {
    this.loadUsers();
  }

  ngOnInit() { }

  /**
   * Carica le Informazioni degli Utenti della Piattaforma.
   */
  async loadUsers() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/admin/utenti', { headers }).subscribe(
      async (res) => {
        this.users = this.users.concat(res['results']);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Errore!');
      });
  }

  loadMore(event) {
    //TODO:
    // this.page++;
    // this.loadUsers(event);

    // if (this.page === this.maximumPages) event.target.disabled = true;
  }

  /**
   * Ordina l'Array degli Utenti attraverso una key.
   * @param key Attributo degli Utenti su cui effettuare l'Ordinamento
   */
  sortBy(key) {
    this.sortKey = key;
    this.sortDirection++;
    this.sort();
  }

  /**
   * Ordina l'Array degli Utenti.
   * //TODO finire commento
   */
  sort() {
    if (this.sortDirection == 1) {
      this.users = this.users.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        return valA.localeCompare(valB);
      });
    } else if (this.sortDirection == 2) {
      this.users = this.users.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        return valB.localeCompare(valA);
      });
    } else {
      this.sortDirection = 0;
      this.sortKey = null;
    }
  }

  /**
   * Abilita il selezionamento multiplo degli elementi per l'eliminazione.
   */
  toggleBulkEdit() {
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  /**
   * Rimuove tutti gli utenti selezionati dall'array degli utenti e ritorna un array con i loro username.
   * 
   * @returns un array con gli username degli utenti da eliminare dal database
   */
  getUsernamesToDelete() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);
    const usernamesToDelete = [];

    while (indexesToDelete.length) {
      usernamesToDelete.push(this.users[indexesToDelete.pop()].username)
    }

    return usernamesToDelete;
  }

  /**
   * Elimina gli utenti dalla tabella nel front-end.
   */
  deleteUsersFromTable() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexesToDelete.length) {
      this.users.splice(indexesToDelete.pop(), 1);
    }
  }

  /**
   * Controlla se ci sono utenti selezionati tramite le checkbox.
   * 
   * @returns true se almeno un elemento è selezionato, false altrimenti
   */
  checkSelectedUsers() {
    var selected = false;
    let keys = Object.keys(this.edit);
    while (keys.length) {
      if (this.edit[keys.pop()]) selected = true;
    }
    return selected;
  }

  /**
   * Mostra un alert per chiedere conferma dell'eliminazione e in caso positivo elimina gli utenti.
   */
  async bulkDelete() {
    if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object && this.checkSelectedUsers()) {
      var messaggio = "Sei sicuro di voler eliminare gli utenti selezionati?";

      this.alertCreator.createConfirmationAlert(messaggio, () => { this.deleteUsers(); });
    } else {
      var messaggio = 'Seleziona prima qualche elemento!';

      this.alertCreator.createInfoAlert('Errore', messaggio);
    }
  }

  /**
   * Effettua la chiamata REST per eliminare gli utenti selezionati dal database e se l'esito è
   * positivo li elimina anche dalla tabella nel front-end.
   */
  async deleteUsers() {
    const tokenValue = (await this.loginService.getToken()).value;
    var headers = { 'token': tokenValue, 'users_to_delete': this.getUsernamesToDelete() };
    console.log('headers.users_to_delete: ', headers.users_to_delete);

    this.http.delete('/admin/utenti', { headers }).subscribe(
      async (res) => {
        this.deleteUsersFromTable();
        this.toggleBulkEdit();
        const message = 'Gli utenti selezionati sono stati eliminati';
        this.alertCreator.createInfoAlert('Eliminazione completata', message);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Eliminazione fallita');
      });
  }

  /**
   * Apre una modal per modificare i dati dell'account dell'utente selezionato.
   * 
   * @param user l'utente selezionato nella tabella
   * @param index l'indice della riga dell'utente selezionato nella tabella
   * @returns 
   */
  async editUser(user, index) {
    const modal = await this.modalController.create({
      component: EditUserPage,
      componentProps: {
        username: user.username,
        nome: user.nome,
        cognome: user.cognome,
        tipo: user.tipo
      },
      cssClass: 'edit-user'
    });

    modal.onDidDismiss().then((data) => {
      const modUser = data['data'];
      console.log('mod_user', modUser);

      if (modUser)
        this.users[index] = modUser;
    });

    return await modal.present();
  }
}
