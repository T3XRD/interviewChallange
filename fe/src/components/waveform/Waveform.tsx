import { canvasDimensions } from './constants.ts';
import { IWaveform } from './types.ts';

export const Waveform = ({ remoteStream }: IWaveform) => {
  let newStream;

  const audioContext = new AudioContext();

  if (remoteStream) {
    newStream = audioContext.createMediaStreamSource(remoteStream);
  }
  const analyser = audioContext.createAnalyser();
  newStream?.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    const canvas = document.getElementById('waveform') as HTMLCanvasElement;
    const canvasContext = canvas?.getContext('2d');
    requestAnimationFrame(draw);

    if (!canvasContext) {
      return;
    }

    analyser.getByteTimeDomainData(dataArray);
    canvasContext.fillStyle = '#242424';
    canvasContext.fillRect(
      0,
      0,
      canvasDimensions.width,
      canvasDimensions.height
    );
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.87)';
    canvasContext.beginPath();

    const sliceWidth = canvasDimensions.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 450.0;
      const y = v * (canvasDimensions.height / 2);

      if (i === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasContext.lineTo(canvasDimensions.width, canvasDimensions.height / 2);
    canvasContext.stroke();
  };

  draw();

  return (
    <div className='waveformContainer' id='canvasContainer'>
      <canvas id='waveform' />
    </div>
  );
};
