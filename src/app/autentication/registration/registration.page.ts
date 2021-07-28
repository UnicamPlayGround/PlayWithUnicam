import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  credenziali: FormGroup



  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      
    })
  }

}
