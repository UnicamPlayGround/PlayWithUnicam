import { Component, Input, OnInit } from '@angular/core';
import { Timer } from './timer';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
  @Input('timer') timer: Timer;

  /**
   * Tempo attuale del Timer
   */
  private currentTime: number = 0;
  private progressBarIncrease: number;

  constructor() { }

  ngOnInit() {
    this.startTimer();
  }

  /**
   * Fa partire il timer.
   */
  startTimer() {
    this.progressBarIncrease = 1 / this.timer.timerTime;
    if (this.timer.enabled) {
      this.changeProgressBar();
    }
  }

  private changeProgressBar() {
    setTimeout(() => {
      this.timer.timerTime--;
      this.currentTime += this.progressBarIncrease;
      var bar = document.getElementById("progress-bar");
      bar.setAttribute("value", this.currentTime.toString());

      if (this.timer.enabled) {
        if (this.timer.timerTime != 0)
          this.changeProgressBar();
        else
          this.timer.cb();
      }

    }, 1000);

  }

}