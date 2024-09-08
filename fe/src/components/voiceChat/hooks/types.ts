export interface IWebRTCHook {
  inputDeviceId: string;
}

export interface IWebSocketHook {
  receiveOffer: (
    incomingOffer: RTCSessionDescription
  ) => Promise<RTCSessionDescriptionInit | undefined>;
  addIceCandidate: (candidate: RTCIceCandidate) => Promise<void>;
  setRemoteDescription: (description: RTCSessionDescription) => Promise<void>;
}
