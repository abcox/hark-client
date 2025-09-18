// Agora Video Demo Component for Angular 19
// Requires: npm install agora-rtc-sdk-ng

import { Component, ElementRef, ViewChild } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-agora-video-demo',
  templateUrl: './agora-video-demo.component.html',
  styleUrls: ['./agora-video-demo.component.scss']
})
export class AgoraVideoDemoComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  client: IAgoraRTCClient;
  localTrack?: ILocalVideoTrack;

  constructor() {
    // Create Agora client
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  async startVideo() {
    // Replace with your Agora App ID and token
    const appId = '129994eebffd4d128c92c3d57dfc98e0';
    const token = '007eJxTYIjZVvNIXCRQnCvgc8qzFQk68Scn2U3PvHvbUGLGT5tQpQMKDIZGlpaWJqmpSWlpKSYphkYWyZZGycYppuYpacmWFqkGs4pPZzQEMjJcMr/AzMgAgSA+D0NKam6+bnJGYl5eag4DAwA3ESK/';
    const channel = 'demo-channel';

    await this.client.join(appId, channel, token, null);

    // Create and play local video track
    this.localTrack = await AgoraRTC.createCameraVideoTrack();
    this.localTrack.play(this.localVideo.nativeElement);

    // Publish local video
    await this.client.publish([this.localTrack]);

    // Subscribe to remote user
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remoteTrack = user.videoTrack as IRemoteVideoTrack;
        remoteTrack.play(this.remoteVideo.nativeElement);
      }
    });
  }

  async stopVideo() {
    // Clean up resources
    this.localTrack?.close();
    await this.client.leave();
  }

  ngOnDestroy() {
    this.stopVideo();
  }
}
