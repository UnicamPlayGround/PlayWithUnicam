import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
})
export class UserPopoverComponent implements OnInit {
  ospite: boolean;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private loginService: LoginService,
    private alertCreator: AlertCreatorService
  ) {
    this.getTipoUtente()
  }

  ngOnInit() { }

  /**
   * Controlla il tipo dell'utente.
   * Se l'utente autenticato è un ospite, la variabile "ospite" viene settata a true,
   * altrimenti viene settata a false.
   */
  async getTipoUtente() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    if (decodedToken.tipo === 'OSPITE') this.ospite = true;
    else if (decodedToken.tipo === 'GIOCATORE') this.ospite = false;
  }

  /**
   * Chiude il popover e inoltra alla pagina "account" per modificare i dati del profilo
   */
  openProfile() {
    this.popoverController.dismiss();
    this.router.navigateByUrl('/account');
  }

  /**
   * Apre una modal chiedendo la conferma per effettuare il logout dal profilo.
   */
  logout() {
    var message = "Sei sicuro di voler effettuare il logout?";
    this.alertCreator.createConfirmationAlert(message, async () => {
      await this.loginService.logout();
      this.popoverController.dismiss();
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  /**
   * Chiude il popover e inoltra alla pagina per effettuare la registrazione
   */
  openRegistration() {
    this.popoverController.dismiss();
    this.router.navigateByUrl('/registration');
  }
}