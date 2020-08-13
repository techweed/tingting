import { Component } from '@angular/core';
import * as firebase from 'firebase/app';

const config = {
  apiKey:'AIzaSyAdkpCKZpAf0E-fnmKKk8rVEYNVBCjBQcI',
  databaseURL:'https://tingting-750e2.firebaseio.com'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TingTing';


  constructor() {
    firebase.initializeApp(config);

  }
}
