import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { Timer } from 'src/app/components/timer/timer';
import { ToastCreatorService } from 'src/app/services/toast-creator/toast-creator.service';
import { Question } from './question';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.page.html',
  styleUrls: ['./question-modal.page.scss'],
})
export class QuestionModalPage implements OnInit {
  question: Question;
  shuffledAnswers: String[] = [];
  selectedAnswer = false;
  correctAnswer: boolean;
  timer: Timer;

  constructor(private modalController: ModalController, private toastCreator: ToastCreatorService) {
    this.question = new Question(
      "Che ore sono?",
      ["11SUPERcalifragilistichespiralidosoSUPERcalifragilistichespiralidoso",
        "22superCALIFRAGILISTICHEspiralidososuperCALIFRAGILISTICHEspiralidoso",
        "33supercalifragilisticheSPIRALIDOSOsupercalifragilisticheSPIRALIDOSO"],
      "https://www.logitech.com/content/dam/logitech/en/products/mice/m171/gallery/m171-gallery-blue-1.png",
      "https://www.youtube.com/embed/lElXAgd1hGA");
    this.timer = new Timer(5, () => { this.closeModal() }, true);
  }

  ngOnInit() {
    console.log(this.question);
    this.setAnswers();
    this.shuffleAnswers();
  }

  /**
   * Inserisce le risposte di una determinata domanda all'interno dell'array 'shuffledAnswers'
   */
  setAnswers() {
    for (let index = 0; index < this.question.answers.length; index++) {
      this.shuffledAnswers.push(this.question.answers[index]);
    }
  }

  /**
   * Mescola le domande da mostrare sulla modal
   */
  shuffleAnswers() {
    for (var i = this.shuffledAnswers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this.shuffledAnswers[i];
      this.shuffledAnswers[i] = this.shuffledAnswers[j];
      this.shuffledAnswers[j] = temp;
    }
    console.log(this.shuffledAnswers);

  }

  /**
   * Chiude la modal passando true se l'utente ha risposto correttamente alla domanda, 
   * false altrimenti.
   */
  closeModal() {
    this.timer.enabled = false;
    //this.modalController.dismiss(this.rispostaCorretta);
  }

  selectAnswer(answer: String) {
    this.selectedAnswer = true;

    if (answer == this.question.answers[0]) {
      this.correctAnswer = true;
      this.toastCreator.creaToast("Risposta corretta!", "bottom", 2000);
    } else {
      this.correctAnswer = false;
      this.toastCreator.creaToast("Risposta errata!", "bottom", 2000);
    }
  }
}
