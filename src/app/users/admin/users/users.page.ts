import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  ngOnInit() {
  }

  loadUsers(event?) {
    // this.http.get('https://randomuser.me/api/?page=${this.page}&results=10')
    //   .subscribe(res => {
    //     console.log('res:', res);
    //     // this.users = res['results'];
    //     this.users = this.users.concat(res['results']);
    //     this.sort();
    //     if (event) event.target.complete();
    //   });

    this.http.get('https://randomuser.me/api/?results=20&page=${this.page}')
      .subscribe(res => {
        console.log('res:', res);
        // this.users = res['results'];
        this.users = this.users.concat(res['results']);
        this.sort();
        if (event) event.target.complete();
      });
  }

  // loadGames(event?) {
  //   // this.http.get('https://randomuser.me/api/?results=20&page=${this.page}')
  //   //   .subscribe(res => {
  //   //     this.games = this.games.concat(res['results']);

  //   //     if (event) event.target.complete();
  //   //   });
  //   this.games = this.games.concat(this.giochi);
  // }

  loadMore(event) {
    this.page++;
    this.loadUsers(event);

    if (this.page === this.maximum_pages) event.target.disabled = true;
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

  toggleBulkEdit() {
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  bulkDelete() {
    let toDelete = Object.keys(this.edit);
    const reallyDelete = toDelete.filter(index => this.edit[index]).map(key => +key);
    while (reallyDelete.length) {
      this.users.splice(reallyDelete.pop(), 1);
    }
    this.toggleBulkEdit();
  }

  removeRow(index) {
    this.users.splice(index, 1);
  }
}
