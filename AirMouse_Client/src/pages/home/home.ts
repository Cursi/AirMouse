import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RemotePage } from '../remote/remote';
import { OnInit } from '@angular/core';

import { AlertController } from 'ionic-angular';

import * as io from 'socket.io-client';

@Component(
{
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit
{
  IP: string;
  PORT: string;

  socket: SocketIOClient.Socket;
  connectDisabled: boolean = false;

  ShowConnectionAlert() 
  {
    const alert = this.alertCtrl.create(
    {
      title: 'Connection error!',
      subTitle: 'Connection could not be established...',
      buttons: ['Retry']
    });
    alert.present();
  }

  Connect()
  {
    const self = this;
    this.connectDisabled = true;

    this.socket = io(this.IP + ":" + this.PORT, 
    {
      reconnection: false,
      timeout: 5000
    });

    this.socket.on("connected", (result) => 
    {
      this.navCtrl.push(RemotePage, 
      {
        socket: self.socket
      }, 
      {
        animate: false
      });
    });

    this.socket.on('connect_error', () => 
    {
      self.connectDisabled = false;
      self.ShowConnectionAlert();
    });
  }

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) 
  {

  }

  ngOnInit()
  {
    
  }
}
