import { ChangeEvent, useEffect, useState } from 'react';
import { useWebRTC, useWebSocket } from './hooks';
import { Select } from '../select';
import { Waveform } from '../waveform';

export const VoiceChat = () => {
  const [inputDeviceId, setInputDeviceId] = useState('default');
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [shouldBeFiltered, setShouldBeFiltered] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const {
    isInit,
    createOffer,
    receiveOffer,
    switchOutput,
    replaceTrack,
    addIceCandidate,
    setRemoteDescription,
    peerConnection,
    isConnected,
    closeOffer,
  } = useWebRTC({ inputDeviceId });
  const { websocket } = useWebSocket({
    receiveOffer,
    addIceCandidate,
    setRemoteDescription,
  });

  useEffect(() => {
    if (isInit && peerConnection) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
        navigator.mediaDevices
          ?.enumerateDevices()
          .then((devices) => setDevices(devices));
      });

      navigator.mediaDevices.addEventListener('devicechange', () => {
        navigator.mediaDevices
          ?.enumerateDevices()
          .then((devices) => setDevices(devices));
      });

      peerConnection?.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          websocket?.send(
            JSON.stringify({ candidate: event.candidate, type: 'iceCandidate' })
          );
        }
      });

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const remoteAudio = document.querySelector('audio');

        if (!remoteAudio) {
          return;
        }

        setRemoteStream(remoteStream);

        remoteAudio.srcObject = remoteStream;
        remoteAudio.play();
      };
    }
  }, [isInit, peerConnection]);

  const makeOffer = async () => {
    const offer = await createOffer();
    websocket?.send(JSON.stringify(offer));
  };

  const onInputClick = async ({ deviceId: id }: MediaDeviceInfo) => {
    setInputDeviceId(id);

    await replaceTrack(id, shouldBeFiltered);
  };

  const onFilterSound = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setShouldBeFiltered(value);
    await replaceTrack(inputDeviceId, value);
  };

  const onOutputClick = async ({ deviceId: id }: MediaDeviceInfo) =>
    await switchOutput(id);

  if (devices.length === 0) {
    return (
      <div className='voiceChat'>Waiting for the Audio Permissions...</div>
    );
  }

  return (
    <div className='voiceChat'>
      <Waveform remoteStream={remoteStream} />
      <div className='controls'>
        <div className='devicesContainer'>
          <Select
            label='Input'
            items={devices?.filter((item) => item.kind === 'audioinput')}
            onClick={onInputClick}
          />
          <Select
            label='Output'
            items={devices?.filter((item) => item.kind === 'audiooutput')}
            onClick={onOutputClick}
          />
        </div>
        <div className='buttonsContainer'>
          <button onClick={makeOffer} disabled={isConnected}>
            Connect
          </button>
          <button onClick={closeOffer} disabled={!isConnected}>
            Disconnect
          </button>
          <label className='checkboxContainer'>
            <input type='checkbox' onChange={onFilterSound} />
            <span>Filter</span>
          </label>
        </div>
      </div>
      <audio />
    </div>
  );
};
