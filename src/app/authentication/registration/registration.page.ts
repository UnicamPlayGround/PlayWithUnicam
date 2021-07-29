import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['../auth.scss'],
})
export class RegistrationPage implements OnInit {

  credenziali: FormGroup

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    })
  }

}
