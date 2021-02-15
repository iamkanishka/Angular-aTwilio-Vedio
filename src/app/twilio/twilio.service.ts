import { connect } from 'twilio-video';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Router } from '@angular/router';
import { baseURL, baseLocalURL } from '../../../constants';
import {BehaviorSubject} from 'rxjs';

// import { Http } from '@angular/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TwilioService {




  constructor(private http: HttpClient, 
    private router: Router,
    private rendererFactory: RendererFactory2) {
      this.renderer = rendererFactory.createRenderer(null, null);
     }

  readonly baseUrl = baseURL;
  readonly baselocal = baseLocalURL;
  readonly accountSid = "AC6fef7014632b1496306b57fda05b3658";
  readonly authToken = "df90b3bf5cfd73104e657a7a42401127";

  createRoom(data:any) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(this.baseUrl + 'api/video/create-room', data, httpOptions);
  }

  joinRoom(data:any) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(this.baseUrl + 'api/video/join-room', data, httpOptions);
  }


  remoteVideo!:ElementRef;
  localVideo!: ElementRef;
  previewing!: boolean;
  msgSubject = new BehaviorSubject("");
  roomObj: any;
  microphone = true;
  roomParticipants:any;
  private renderer: Renderer2;
 


  videoOff() {
    this.roomObj.localParticipant.videoTracks.forEach(( videoTrack:any ) =>{
      videoTrack.track.disable();
        console.log('video off')
      });
      // this.microphone = false;
      console.log(this.roomObj.localParticipant.videoTracks);
  }

  videoOn() {
    this.roomObj.localParticipant.videoTracks.forEach(( videoTrack:any )=> {
      videoTrack.track.enable();
      console.log('video on')
      });
      // this.microphone = true;
      console.log(this.roomObj.localParticipant.videoTracks);
    }

  mute() {
    this.roomObj.localParticipant.audioTracks.forEach(( audioTrack:any ) =>{
        audioTrack.track.disable();
        console.log('muted')
      });
      this.microphone = false;
  }

  unmute() {
  this.roomObj.localParticipant.audioTracks.forEach( ( audioTrack:any ) =>{
    audioTrack.track.enable();
    console.log('unmuted')
    });
    this.microphone = true;
  }

  connectToRoom(accessToken: string, options:any): void {

    connect(accessToken, options).then(room => {
      this.roomObj = room;
      if (!this.previewing && options['video']) {
        this.startLocalVideo();
        this.previewing = true;
      }
      this.roomParticipants = room.participants;
      room.participants.forEach(participant => {
        this.attachParticipantTracks(participant);
      });

      room.on('participantDisconnected', (participant) => {
        this.detachTracks(participant);
      });

      room.on('participantConnected', (participant) => {
        this.roomParticipants = room.participants;
        this.attachParticipantTracks(participant);
        participant.on('trackPublished', track => {
          const element = track.addListener
          this.renderer.data.id = track.trackSid;
          this.renderer.setStyle(element, 'height', '100%');
          this.renderer.setStyle(element, 'max-width', '100%');
          this.renderer.appendChild(this.remoteVideo.nativeElement, element);
        });
      });

      // When a Participant adds a Track, attach it to the DOM.
      room.on('trackPublished', (track, participant) => {
        this.attachTracks([track]);
      });

      // When a Participant removes a Track, detach it from the DOM.
      room.on('trackUnsubscribed', (track:any, participant:any) => {
        this.detachTracks([track]);
      });

      room.once('disconnected', room => {
        room.localParticipant.tracks.forEach((track:any) => {
          track.track.stop();
          const attachedElements = track.track.detach();
          attachedElements.forEach((element:any) => element.remove());
          room.localParticipant.videoTracks.forEach((video:any) => {
            const trackConst = [video][0].track;
            trackConst.stop(); 
            trackConst.detach().forEach((element:any) => element.remove());
            room.localParticipant.unpublishTrack(trackConst);
          });
          let element = this.remoteVideo.nativeElement;
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          let localElement = this.localVideo.nativeElement;
          while (localElement.firstChild) {
            localElement.removeChild(localElement.firstChild);
          }
          this.router.navigate(['patient/view-appointments']);
        });
      });
    }, (error) => {
      alert(error.message);
    });

  }

  attachParticipantTracks(participant:any): void {
    participant.tracks.forEach((part:any) => {
      this.trackPublished(part);
    });
  }
  
  trackPublished(publication:any) {
    if (publication.isSubscribed)
      this.attachTracks(publication.track);
    if (!publication.isSubscribed)
      publication.on('subscribed',( track:any) => {
      this.attachTracks(track);
    });
  }

  attachTracks(tracks:any) {
    const element = tracks.attach();
    this.renderer.data.id = tracks.sid;
    this.renderer.setStyle(element, 'height', '100%');
    this.renderer.setStyle(element, 'max-width', '100%');
    this.renderer.appendChild(this.remoteVideo.nativeElement, element);
  }

  startLocalVideo(): void {
    this.roomObj.localParticipant.videoTracks.forEach((publication:any) => {
      const element = publication.track.attach();
      this.renderer.data.id = publication.track.sid;
      this.renderer.setStyle(element, 'width', '25%');
      this.renderer.appendChild(this.localVideo.nativeElement, element);
    });
  }

  detachTracks(tracks:any): void {
    tracks.tracks.forEach((track:any) => {
    let element = this.remoteVideo.nativeElement;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
      }
    });
  }

}
