import { useEffect, useRef, useState } from 'react';
import { IWebRTCHook } from './types.ts';
import { soundFilter } from '../utils.ts';

export const useWebRTC = ({ inputDeviceId }: IWebRTCHook) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInit, setIsInit] = useState(false);

  const init = () => {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection();
    }

    peerConnection.current.onconnectionstatechange = (event) => {
      const connection = event.currentTarget as RTCPeerConnection;
      if (connection.connectionState === 'connected') {
        setIsConnected(true);
      }
      if (connection.connectionState === 'disconnected') {
        setIsConnected(false);
        setIsInit(false);
        peerConnection.current = new RTCPeerConnection();
      }
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log(
        'ICE connection state changed:',
        peerConnection.current?.iceConnectionState
      );
    };
  };

  useEffect(() => {
    if (isInit) {
      return;
    }

    init();
    setIsInit(true);
  }, [isInit]);

  const startStream = async () => {
    await navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: { exact: inputDeviceId } } })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
      });
  };

  const replaceTrack = async (
    inputDeviceId?: string,
    shouldBeFiltered?: boolean
  ) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: inputDeviceId } },
    });
    let filteredTrack;

    if (shouldBeFiltered) {
      filteredTrack = soundFilter(stream, shouldBeFiltered);
    }

    const track = filteredTrack || stream.getAudioTracks()[0];
    const sender = peerConnection.current
      ?.getSenders()
      .find((sender) => sender.track?.kind === 'audio');

    if (sender) {
      await sender.replaceTrack(track);
    }
  };

  const switchOutput = async (outputDeviceId?: string) => {
    const audioElement = document.querySelector<HTMLAudioElement>('audio');

    if (!audioElement || !outputDeviceId) {
      return;
    }

    await audioElement.setSinkId(outputDeviceId);
  };

  const closeOffer = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setIsInit(false);
    setTimeout(() => setIsConnected(false), 5500);
  };

  const receiveOffer = async (incomingOffer: RTCSessionDescriptionInit) => {
    if (!peerConnection) {
      return;
    }

    await peerConnection.current?.setRemoteDescription(
      new RTCSessionDescription(incomingOffer)
    );
    await startStream();
    console.log(peerConnection.current);
    const answer = await peerConnection.current?.createAnswer();
    await peerConnection.current?.setLocalDescription(answer);

    return answer;
  };

  const createOffer = async () => {
    if (!peerConnection) {
      return;
    }

    await startStream();

    const offerDescription = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offerDescription);

    return offerDescription;
  };

  const addIceCandidate = async (candidate: RTCIceCandidate) => {
    await peerConnection.current?.addIceCandidate(candidate);
  };
  const setRemoteDescription = async (description: RTCSessionDescription) => {
    await peerConnection.current?.setRemoteDescription(description);
  };

  return {
    isInit,
    createOffer,
    receiveOffer,
    addIceCandidate,
    setRemoteDescription,
    replaceTrack,
    switchOutput,
    peerConnection: peerConnection.current,
    isConnected,
    closeOffer,
  };
};
