import { Component } from '@angular/core';

@Component({
  selector: 'evg-speaking',
  templateUrl: './speaking.component.html',
  styleUrls: ['./speaking.component.scss']
})
export class SpeakingComponent {
  tiles = [
    {
      title: 'Pluggable Angular Apps',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=TEQdl3Pigiw&t=673s',
      thumbnail: 'http://img.youtube.com/vi/TEQdl3Pigiw/0.jpg',
      cols: 3,
      rows: 3
    },
    {
      title:
        'AngularFire: Bringing together Angular and Firestore for rapid application development',
      format: 'Conference',
      url: 'https://www.youtube.com/watch?v=-CTSBeaz4x4&t=3s',
      thumbnail: 'http://img.youtube.com/vi/-CTSBeaz4x4/0.jpg',
      cols: 2,
      rows: 2
    },
    {
      title: 'Runtime performance checklist',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=cxqRijt9LbQ&t=668s',
      thumbnail: 'http://img.youtube.com/vi/cxqRijt9LbQ/0.jpg',
      cols: 2,
      rows: 2
    },
    {
      title: 'The State of Angular 2019',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=CIBiKDpfCXI&t=15s',
      thumbnail: 'http://img.youtube.com/vi/CIBiKDpfCXI/0.jpg',
      cols: 2,
      rows: 1
    },
    {
      title: 'Angular Prototyping and Documentation with StackBlitz',
      format: 'Conference',
      url: 'http://www.lrtechfest.com/events/2018',
      thumbnail: 'assets/lrtf.png',
      cols: 1,
      rows: 1
    },
    {
      title:
        'AngularFire: Bringing together Angular and Firestore for rapid application development',
      format: 'Conference',
      thumbnail: 'assets/lrtf.png',
      url: 'http://www.lrtechfest.com/events/2018',
      cols: 1,
      rows: 1
    },
    {
      title: 'Dependency Injection in Angular 2.0 (alpha)',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=QTy3KJI4MrY&t=123s',
      thumbnail: 'http://img.youtube.com/vi/QTy3KJI4MrY/0.jpg',
      cols: 1,
      rows: 1
    },
    {
      title: 'Smart/View Component Pattern',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=ALm_JVdLT2E&t=13s',
      thumbnail: 'http://img.youtube.com/vi/ALm_JVdLT2E/0.jpg',
      hasThumbnail: true,
      cols: 1,
      rows: 1
    },
    {
      title: 'State Management Discussion',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=Gn15wum7T6A&t=1s',
      thumbnail: 'http://img.youtube.com/vi/Gn15wum7T6A/0.jpg',
      cols: 1,
      rows: 1
    },
    {
      title: 'Using GulpJS',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=xbxc8bNx8ls&t=9s',
      thumbnail: 'http://img.youtube.com/vi/xbxc8bNx8ls/0.jpg',
      cols: 1,
      rows: 1
    },
    {
      title: 'AngularJS Component Router',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=emfKmJiWfkU&t=7s',
      thumbnail: 'http://img.youtube.com/vi/emfKmJiWfkU/0.jpg',
      cols: 1,
      rows: 1
    },
    {
      title: 'Angular 2: Working with Alphas',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=ORst0J52OZI&t=96s',
      thumbnail: 'http://img.youtube.com/vi/ORst0J52OZI/0.jpg',
      cols: 1,
      rows: 1
    },
    {
      title: 'ngHouston: Angular FireStore',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=xdyDIchKOcE&t=2764s',
      thumbnail: 'http://img.youtube.com/vi/xdyDIchKOcE/0.jpg',
      cols: 2,
      rows: 2
    },
    {
      title: 'ngHouston: Angular Performance Playground',
      format: 'User Group',
      thumbnail: 'http://img.youtube.com/vi/Rxglymgf2ZY/0.jpg',
      url: 'https://www.youtube.com/watch?v=Rxglymgf2ZY&t=2508s',
      cols: 1,
      rows: 1
    },
    {
      title: 'ngRx',
      format: 'User Group',
      url: 'https://www.youtube.com/watch?v=gUZ0d8fjATc&t=111s',
      thumbnail: 'http://img.youtube.com/vi/gUZ0d8fjATc/0.jpg',
      cols: 1,
      rows: 2
    }
  ];

  comingSoon = [
    {
      title: 'Painless PWAs with Angular',
      format: 'workshop',
      url:
        'https://www.angularconnect.com/workshops/painless-pwas-with-angular',
      svg: 'assets/accolournotext.svg',
      cols: 2,
      rows: 2
    },
    {
      title: 'Cypress - It\'s time we give E2E testing another shot!',
      format: 'conference',
      url: 'https://www.nwatechsummit.com',
      thumbnail: 'assets/nwa.PNG'
    },
    {
      title: 'Cypress - It\'s time we give E2E testing another shot!',
      thumbnail: 'assets/google.png',
      format: 'conference',
      url: 'https://stldevfest.com/'
    }
  ];
}
