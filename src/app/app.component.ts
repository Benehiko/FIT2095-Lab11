import {Component, OnInit} from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  messageText: string;
  name: string;
  file = '';
  messages: Array<any> = [];
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io.connect();
  }

  ngOnInit() {
    this.messages = [];
    this.listen2Events();
    this.convert2Events();
  }

  listen2Events() {
    this.socket.on('msg', data => {
      this.messages.push(data);
    });
  }

  convert2Events() {
    this.socket.on('convert', data => {
      if (data.status === true) {
        this.file = data.id;
      } else {
        this.file = '';
      }
    });
  }

  sendMessage() {
    const data = {
      'msg': this.messageText,
      'author': this.name
    };
    this.socket.emit('newMsg', data);
    this.messageText = '';
    this.name = '';
  }

  text2speech() {
    this.socket.emit('convert', {'msg': this.messages});
  }
}
