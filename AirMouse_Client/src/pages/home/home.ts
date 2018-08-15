import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RemotePage } from '../remote/remote';

import { OnInit } from '@angular/core';

@Component(
{
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit
{
  Connect()
  {
    this.navCtrl.setRoot(RemotePage);
  }

  constructor(public navCtrl: NavController) 
  {

  }

  ngOnInit()
  {
    console.log("loaded");
  }

}
