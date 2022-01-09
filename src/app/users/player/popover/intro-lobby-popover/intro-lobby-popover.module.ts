import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IntroLobbyPopoverComponent } from './intro-lobby-popover.component';

import { CreaLobbyPageModule } from '../../modal/crea-lobby/crea-lobby.module';
import { CercaPrivataPageModule } from '../../modal/cerca-privata/cerca-privata.module';
import { CercaPubblicaPageModule } from '../../modal/cerca-pubblica/cerca-pubblica.module';
import { EditGamePageModule } from 'src/app/users/admin/modal-pages/edit-game/edit-game.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        CreaLobbyPageModule,
        CercaPrivataPageModule,
        CercaPubblicaPageModule,
        EditGamePageModule
    ],
    declarations: [IntroLobbyPopoverComponent]
})
export class IntroLobbyComponentModule { }