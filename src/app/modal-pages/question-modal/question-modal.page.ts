import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, NavParams } from '@ionic/angular';
import { Timer } from 'src/app/components/timer-components/timer';
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
  timer: Timer = new Timer(30, false, () => { this.closeModal(); });

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private toastCreator: ToastCreatorService) {
  }

  ngOnInit() {
    this.question = this.navParams.get('question');
    this.setAnswers();
    this.shuffleAnswers();
    this.timer.setTimerTime(this.question.countdownSeconds);
    this.timer.startTimer();
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
  }

  /**
   * Chiude la modal passando true se l'utente ha risposto correttamente alla domanda, 
   * false altrimenti.
   */
  closeModal() {
    this.timer.enabled = false;
    this.modalController.dismiss(this.correctAnswer);
  }

  selectAnswer(answer: String, index: Number) {
    this.timer.enabled = false;
    this.selectedAnswer = true;

    if (answer == this.question.answers[0]) {
      this.correctAnswer = true;
      this.toastCreator.creaToast("Risposta corretta!", "top", 2000);
      document.getElementById("answer" + index).classList.add("correct-answer");
    } else {
      this.correctAnswer = false;
      this.toastCreator.creaToast("Risposta errata!", "top", 2000);
      document.getElementById("answer" + index).classList.add("wrong-answer");
    }
  }

}
