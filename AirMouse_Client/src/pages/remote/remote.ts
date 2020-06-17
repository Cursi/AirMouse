import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Insomnia } from '@ionic-native/insomnia';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import * as io from 'socket.io-client';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { HelpPage } from '../help/help';
import { SettingsPage } from '../settings/settings';

@IonicPage()
@Component({
  selector: 'page-remote',
  templateUrl: 'remote.html',
  providers: [ Gyroscope, Insomnia ]
})

export class RemotePage
{
  constructor(public navCtrl: NavController, public navParams: NavParams, private gyroscope: Gyroscope, private insomnia: Insomnia) { }

  helpPage: any = HelpPage;
  settingsPage: any = SettingsPage;

  socket: SocketIOClient.Socket = this.navParams.get("socket");
  
  // Get from local storage
  settings =
  {
    movePreferenceFactor: 70,
    scrollPreferenceFactor : 60,
    pinchSensitivity: 40
  };
  settingsParams = 
  {
      socket: this.socket,
    settings: this.settings
  }
  
  gyroAvailable: boolean = true;
  gyroOptions: GyroscopeOptions =
  {
    frequency: 16
  };
  gyro =
  {
    gyroX: null,
    gyroZ: null
  };
  
  epsilonGyroVelocity: number = 0.0130;
  
  scroll =
  {
    scrollX: null,
    scrollY: null
  };
  
  mouseCanvas: any;
  mc: any;
  
  doubleClickDelay: number = 200;
  numberOfTaps: number = 0;
  doubleClickTimer: any = null;
  
  mousePressedDown: boolean = false;
  
  DrawCircleTap(clientX, clientY, isScrollCircle)
  {
    if(clientX != null && clientY != null)
    {
      var tapCircle = document.createElement("span");
      tapCircle.classList.add("tapCircle");
  
      if(isScrollCircle)
      {
        tapCircle.style.width = "25px";
        tapCircle.style.height = "25px";
      }
      else
      {
        tapCircle.style.width = "50px";
        tapCircle.style.height = "50px";
      }

      tapCircle.style.left = clientX - 25 + "px";
      tapCircle.style.top = clientY - 25 + "px";
      
      if(this.mousePressedDown)
      {
        tapCircle.classList.add("fixedCircle");
        tapCircle.id = "mousePressedCircle";
      }
      else
      {
        setTimeout(() => 
        {
          this.mouseCanvas.removeChild(tapCircle);
        }, 300);
      }

      this.mouseCanvas.appendChild(tapCircle);
    }
  }

  SingleTap(event)
  {
    this.numberOfTaps++;

    if(this.doubleClickTimer == null)
    {
      this.doubleClickTimer = setTimeout(() =>
      {
        this.DrawCircleTap(event.clientX, event.clientY, false);
        
        switch(this.numberOfTaps)
        {
          case 1: 
          {
            this.wasSingleTap = true;
            this.socket.emit('mouseSingleTap');
            
            setTimeout(() =>
            {
              this.wasSingleTap = false;
            }, this.doubleClickDelay);
            break;
          }
          case 2:
          {      
            this.wasSingleTap = false;
            this.socket.emit('mouseDoubleTap');
            break;
          }
          default: break;
        }

        this.numberOfTaps = 0;
        this.doubleClickTimer = null;
      }, this.doubleClickDelay);
    }
  }
  
  Pan(event)
  {
    if(!this.mousePressedDown)
    {
      this.DrawCircleTap(event.center.x, event.center.y, true);
  
      this.scroll.scrollX = event.velocityX;
      this.scroll.scrollY = event.velocityY;
            
      this.socket.emit('mouseScroll', this.scroll); 
    }
  }
  
  PanEnd()
  {
    if(this.mousePressedDown)
    {
      this.PressUp();
    }
  }

  wasSingleTap: boolean = false;  

  PressDown(event)
  {
    this.mousePressedDown = true;
    if(event != null) this.DrawCircleTap(event.center.x, event.center.y, false);

    if(this.wasSingleTap)
    {
      this.socket.emit('mousePressDown');
    }
    else
    {
      this.socket.emit('mouseRightTap');
    }
  }

  PressUp()
  {
    this.mousePressedDown = false;
    this.wasSingleTap = false;
    
    this.RemoveCircle();

    this.socket.emit('mousePressUp');
  }

  Pinch(event)
  {
    if(!this.mousePressedDown)
    {
      this.DrawCircleTap(event.srcEvent.clientX, event.srcEvent.clientY, true);
      this.socket.emit('mousePinch', event.scale);
    }
  }

  PinchEnd()
  {
    if(this.mousePressedDown)
    {
      this.mousePressedDown = false;
      this.RemoveCircle();
    }
    else
    {
      this.socket.emit('mousePinchEnd');
    }
  }

  RemoveCircle()
  {
    var mousePressedCircle = document.getElementById("mousePressedCircle");

    try
    {
      this.mouseCanvas.removeChild(mousePressedCircle);
    }
    catch(error) { }
  }
  
  SendGyroData()
  {
    try
    {
      this.gyroscope.watch(this.gyroOptions).subscribe((orientation: GyroscopeOrientation) =>
      {
        if(Math.abs(orientation.z) > this.epsilonGyroVelocity && Math.abs(orientation.x) > this.epsilonGyroVelocity)
        {
          this.gyro.gyroX = orientation.x;
          this.gyro.gyroZ = orientation.z;
          
          this.socket.emit ('gyroChanged', this.gyro);
        }
      });
    }
    catch(error)
    {
      this.gyroAvailable = false;
    }
  }

  ionViewDidLoad() 
  {
    this.mouseCanvas = document.getElementById("canvas");
    this.SendGyroData();

    this.gyroAvailable = true;
    
    if(this.gyroAvailable)
    {
      this.insomnia.keepAwake();

      this.mc = new Hammer(this.mouseCanvas);
      this.mc.add(new Hammer.Pinch());
      this.mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      this.mc.on("tap", () => this.SingleTap(event));
      this.mc.on("pan", (event) => this.Pan(event));
      this.mc.on("panend", () => this.PanEnd());
      this.mc.on("press", (event) => this.PressDown(event));
      this.mc.on("pressup", () => this.PressUp());
      this.mc.on("pinch", (event) => this.Pinch(event));
      this.mc.on("pinchend", () => this.PinchEnd());      
    }
    else
    {
      this.mouseCanvas.innerHTML = 
        "<span id='containerCatch'>" +
          "<span id='appNameCatch'>AirMouse</span>" +  
          " is not available for your device. :(" +
        "</span>";
    }
  }
}