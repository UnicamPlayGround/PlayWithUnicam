import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login.service';
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
  maximum_pages = 2;

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private alertController: AlertController,
    private loginService: LoginService
  ) {
    this.loadUsers();
  }

  ngOnInit() {
  }

  async loadUsers(event?) {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/admin/utenti', { headers }).subscribe(
      async (res) => {
        this.users = this.users.concat(res['results']);
        // this.reloadManager.completaReload(event);
      },
      async (res) => {
        //TODO:gestione stampa errore
        // this.errorManager.stampaErrore(res, 'Errore');
        // this.reloadManager.completaReload(event);
      });
  }

  loadMore(event) {
    //TODO:
    // this.page++;
    // this.loadUsers(event);

    // if (this.page === this.maximum_pages) event.target.disabled = true;
  }

  sortBy(key) {
    this.sortKey = key;
    this.sortDirection++;
    this.sort();
  }

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

  // Abilita il selezionamento multiplo degli elementi per l'eliminazione
  toggleBulkEdit() {
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  // Rimuove tutti gli utenti selezionati dall'array degli utenti e ritorna un array con i loro username
  getUsernamesToDelete() {
    let toDelete = Object.keys(this.edit);
    const indexes_to_delete = toDelete.filter(index => this.edit[index]).map(key => +key);
    const usernames_to_delete = [];

    while (indexes_to_delete.length) {
      usernames_to_delete.push(this.users[indexes_to_delete.pop()].username)
    }

    return usernames_to_delete;
  }

  deleteUsersFromTable() {
    let toDelete = Object.keys(this.edit);
    const indexes_to_delete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexes_to_delete.length) {
      this.users.splice(indexes_to_delete.pop(), 1);
    }
  }

  //TODO: crea component/service
  async presentAlertConfirm() {
    if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object) {
      var messaggio = "Sei sicuro di voler eliminare gli utenti selezionati?";

      const alert = await this.alertController.create({
        header: 'Conferma',
        message: messaggio,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Okay',
            handler: () => {
              this.bulkDelete();
            }
          }
        ]
      });

      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Errore',
        message: 'Seleziona prima qualche elemento!',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  //TODO: mettere alert per chiedere conferma
  async bulkDelete() {
    const token_value = (await this.loginService.getToken()).value;
    var headers = { 'token': token_value, 'users_to_delete': this.getUsernamesToDelete() };
    console.log('headers.users_to_delete: ', headers.users_to_delete);

    this.http.delete('/admin/utenti', { headers }).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          this.deleteUsersFromTable();
          const text = 'Gli utenti selezionati sono stati eliminati';
          const alert = await this.alertController.create({
            header: 'Eliminazione completata',
            message: text,
            buttons: ['OK'],
          });
          this.toggleBulkEdit();
          await alert.present();
        },
        async (res) => {
          //TODO: stampa errore
          // this.errorManager.stampaErrore(res, 'Eliminazione Fallita');
        });
  }

  async editUser(user, index) {
    const modal = await this.modalController.create({
      component: EditUserPage,
      componentProps: {
        username: user.username,
        nome: user.nome,
        cognome: user.cognome,
        tipo: user.tipo
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then((data) => {
      const mod_user = data['data'];
      console.log('mod_user', mod_user);

      if (mod_user)
        this.users[index] = mod_user;
    });

    return await modal.present();
  }
}
