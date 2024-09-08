import { useEffect, useState } from 'react';
import { WSResponseType, WSResponseTypes } from '../types.ts';
import { IWebSocketHook } from './types.ts';

export const useWebSocket = ({
  receiveOffer,
  addIceCandidate,
  setRemoteDescription,
}: IWebSocketHook) => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket(`ws://${window.location.hostname}:8080`);
    setWebsocket(newSocket);

    newSocket.onmessage = async (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data);

      switch (data.type as WSResponseType) {
        case WSResponseTypes.answer: {
          await setRemoteDescription(new RTCSessionDescription(data));

          return;
        }
        case WSResponseTypes.iceCandidate: {
          await addIceCandidate(data.candidate);

          return;
        }
        case WSResponseTypes.offer: {
          const answer = await receiveOffer(data);
          newSocket?.send(JSON.stringify(answer));

          return;
        }
      }
    };

    return () => {
      newSocket.close();
    };
  }, []);

  return { websocket: websocket, sendMessage: websocket?.send };
};
