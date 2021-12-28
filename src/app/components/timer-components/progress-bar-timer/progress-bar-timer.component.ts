import { Component, Input, OnInit } from '@angular/core';
import { Timer } from '../timer';
import { TimerComponents } from '../timer-components';

@Component({
  selector: 'app-progress-bar-timer',
  templateUrl: './progress-bar-timer.component.html',
  styleUrls: ['./progress-bar-timer.component.scss'],
})
export class ProgressBarTimerComponent implements OnInit, TimerComponents {
  @Input('timer') timer: Timer;
  @Input('color') color: String;
  @Input('reversed') reversed: String;

  /**
   * Tempo attuale del Timer
   */
  private currentTime: number = 0;
  private progressBarIncrease: number;

  constructor() { }

  ngOnInit() {
    this.timer.setTimerComponent(this);
    this.startTimer();
  }

  /**
   * Fa partire il timer.
   */
  startTimer() {
    this.progressBarIncrease = 1 / this.timer.getTimerTime();
    if (this.timer.enabled) {
      this.changeProgressBar();
    }
  }

  private changeProgressBar() {
    setTimeout(() => {
      this.timer.decreaseTimeLeft();
      this.currentTime += this.progressBarIncrease;
      var bar = document.getElementById("progress-bar");
      if (bar)
        bar.setAttribute("value", this.currentTime.toString());

      if (this.timer.enabled) {
        if (this.timer.getTimeLeft() != 0)
          this.changeProgressBar();
        else
          this.timer.cb();
      }

    }, 1000);
  }

}