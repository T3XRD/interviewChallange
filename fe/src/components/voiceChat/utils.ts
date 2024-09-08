export const soundFilter = (stream: MediaStream, isFiltered: boolean) => {
  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  const biquadFilter = audioContext.createBiquadFilter();
  const dest = audioContext.createMediaStreamDestination();
  const audioSource = audioContext.createMediaStreamSource(stream);

  audioSource.disconnect();
  gainNode.disconnect();
  biquadFilter.disconnect();

  biquadFilter.type = 'lowpass';
  gainNode.gain.value = isFiltered ? 0.75 : 1;
  biquadFilter.frequency.value = 200;

  if (isFiltered) {
    audioSource.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(dest);
  } else {
    audioSource.connect(gainNode);
    gainNode.connect(dest);
  }

  return dest.stream.getAudioTracks()[0];
};
