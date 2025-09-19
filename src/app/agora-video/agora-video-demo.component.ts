// Agora Video Demo Component for Angular 19
// Requires: npm install agora-rtc-sdk-ng

import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

@Component({
    selector: 'app-agora-video-demo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './agora-video-demo.component.html',
    styleUrls: ['./agora-video-demo.component.scss']
})
export class AgoraVideoDemoComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  client: IAgoraRTCClient;
  localVideoTrack?: ILocalVideoTrack;
  localAudioTrack?: IMicrophoneAudioTrack;

  microphones: MediaDeviceInfo[] = [];

  async ngOnInit() {
    this.microphones = await AgoraRTC.getMicrophones();
  }

  constructor() {
    // Create Agora client
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  async startVideo() {
    // Replace with your Agora App ID and token
    const appId = '129994eebffd4d128c92c3d57dfc98e0';
    const token = '007eJxTYNBYceq9lrhYj+4Gu/3rrK+LvroUyZm+PuKdqkWVanJuzQsFBkMjS0tLk9TUpLS0FJMUQyOLZEujZOMUU/OUtGRLi1SDuOtnMxoCGRliJ31kYIRCEJ+HISU1N183OSMxLy81h4EBAEDkIuc=';
    const channel = 'demo-channel';

    await this.client.join(appId, channel, token, null);

    // Create and play local video track
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    this.localVideoTrack.play(this.localVideo.nativeElement);

    // Publish local video
    await this.client.publish([this.localVideoTrack]);

    // Create and publish local audio track
    // TODO: List available microphones and use selected one
    this.microphones = await AgoraRTC.getMicrophones();
    console.log('Available microphones:', this.microphones);
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(this.microphones[2]?.deviceId ? { microphoneId: this.microphones[2].deviceId } : undefined);
    await this.client.publish([this.localAudioTrack]);

    // Subscribe to remote user
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remoteTrack = user.videoTrack as IRemoteVideoTrack;
        remoteTrack.play(this.remoteVideo.nativeElement);
      }
      if (mediaType === 'audio' && user.audioTrack) {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    });
  }

  async stopVideo() {
    // Clean up resources
    this.localVideoTrack?.close();
    await this.client.leave();
  }

  ngOnDestroy() {
    this.stopVideo();
  }
}
