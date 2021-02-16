import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { connect, createLocalTracks } from "twilio-video";
import { TwilioService } from '../twilio/twilio.service';
TwilioService

@Component({
  selector: 'app-twilio-room',
  templateUrl: './twilio-room.component.html',
  styleUrls: ['./twilio-room.component.css']
})
export class TwilioRoomComponent implements OnInit {

  roomName : string="vediochat";
  accessToken :string= "df90b3bf5cfd73104e657a7a42401127";


  @ViewChild('localVideo', {read: ElementRef}) localVideo!  : ElementRef;
  @ViewChild('remoteVideo', {read: ElementRef}) remoteVideo! : ElementRef;
  
  canShow : Boolean = false;
  obj:any;


    ngAfterViewInit(): void {
        console.log( "here" ,this.localVideo.nativeElement);
        console.log( "there" ,this.remoteVideo.nativeElement);
        this.twilioService.localVideo = this.localVideo;
        this.twilioService.remoteVideo = this.remoteVideo;
        this.connect();
    }


  ngOnInit(): void {
    // console.log(this.elRef.nativeElement);
  }

 
  constructor( private router: Router,
        private _route : ActivatedRoute,
        public twilioService: TwilioService) {

        try {
          
       
           

      // this._route.queryParamMap.subscribe((params) => { 
      //   this.obj = { ...params.keys, ...params }; 
      // });
      // this.roomName = this.obj.params.id;
      // this.accessToken = this.obj.params.token;
      if (navigator.getUserMedia){
        navigator.getUserMedia({ audio: true, video: true }, function (stream) {  }, function (error) {
        console.log(error.name + ':' + error.message);
        });
      }
      // this.roomName = localStorage.getItem('room-name');
      // this.accessToken = localStorage.getItem('room-token');
      window.addEventListener('unload', () => {
        this.disconnect();
      });
    } catch (error) {
        console.log(error);
          
    }

    
  }


  disconnect() {
    if (this.twilioService.roomObj && this.twilioService.roomObj !== null) {
      console.log(this.twilioService.roomObj);
      this.twilioService.roomObj.disconnect();
      this.twilioService.roomObj = null;
    } 
    else console.log('disconnected');
  }

  connect() {
    
    this.twilioService.connectToRoom(this.accessToken , {
      name: this.roomName,
      audio: true,
      video: { height: 720, frameRate: 24, width: 1280 },
      bandwidthProfile: {
      video: {
        mode: 'collaboration',
        renderDimensions: {
          high: { height: 1080, width: 1980 },
          standard: { height: 720, width: 1280 },
          low: { height: 176, width: 144 }
        }
      }
    },
    });
  }

  isOn: Boolean = true;
  toggleVideo(){
    if(this.isOn === true){
      this.twilioService.videoOff();
      this.isOn = false;
    }
    else{
      this.twilioService.videoOn();
      this.isOn = true;
    }
  }

  isMuted: Boolean = false;
  toggleMute(){
    if(this.isMuted === true){
      this.twilioService.unmute();
      this.isMuted = false;
    }
    else{
      this.twilioService.mute();
      this.isMuted = true;
    }
  }
  
  mute() { this.twilioService.mute(); }

  unmute() { this.twilioService.unmute();}

  ngOnDestroy() { this.disconnect(); }


}
