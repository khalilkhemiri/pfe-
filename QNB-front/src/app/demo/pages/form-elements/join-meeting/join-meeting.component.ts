import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-meeting-join',
  template: `<div #jitsiContainer style="height: 100vh; width: 100%;"></div>`,
  standalone: true
})
export class JoinMeetingComponent implements OnInit {

 @ViewChild('jitsiContainer', { static: true }) jitsiContainer!: ElementRef<HTMLDivElement>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const roomID = this.route.snapshot.paramMap.get('roomID') || 'defaultRoom';
    const domain = 'meet.jit.si';

    const options = {
      roomName: roomID,
      parentNode: this.jitsiContainer.nativeElement,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: 'User_' + Math.floor(Math.random() * 10000)
      }
    };

    // @ts-ignore
    const api = new (window as any).JitsiMeetExternalAPI(domain, options);

    api.addEventListener('videoConferenceJoined', () => {
      console.log('Joined the meeting:', roomID);
    });
  }
}