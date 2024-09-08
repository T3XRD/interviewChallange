# Interview Challenge - WebRTC Audio Streaming

## 1) Install Dependencies
Run the following command to prepare all the packages needed for both the backend (BE) and frontend (FE):

```bash
yarn prep
```

## 2) Start the WebSocket Server (Backend)
Run the following command to start the WebSocket server, which works as a signaling server for WebRTC:

```bash
yarn start:be
```

The server will run on port `8080`.

## 3) Start the Frontend Application
Run the following command to start the frontend application:

```bash
yarn start:fe
```

Once the frontend is running, details such as the local and network URLs will be displayed in the terminal. It will look something like this:

```
  ➜  Local:  http://localhost:5173
```

# Brief Explanation:

**This project only work on 1 machine. To work on different machinecs locally you would need https to work with .getUserMedia()**

## Project Overview
This project implements React app that streams audio from one client to another via WebRTC for peer-to-peer connection.  
The server is built using `Express.js` and `ws` packages. I'm using WebSockets for a reliable and fast communication between clients.  
WebSockets are responsible for sending and receiving of offers, answers, and IceCandidates.  
Additionally, this app implements a basic sound manipulation controls such as gain and frequency filter.  
Lastly, this app implements a real-time audio visualization in a waveform using `Canvas API` and `Audio Context API`  

Technologies used: React + Vite, TS, JS, Express, WebSockets, WebRTC, CSS

## Process and features:

### Step 1: Audio Streaming (Core Requirement)
- I utilized WebRTC to create a peer-to-peer audio streaming solution between two users. WebSockets were chosen as the signaling mechanism to exchange SDP (Session Description Protocol) offers, answers, and ICE candidates.
- The `RTCPeerConnection` API was used to handle media stream connections, while the Web Audio API enabled manipulation of audio data.
  1) We request permission from the user to use their audio.

  2) After we receive that permission, we initialize the peer connection via `new RTCPeerConnection()`.

  3) We add all the needed event listeners on `'icecandidate'`, `'devicechange'`, and `'ontrack'`.  
    These are important to have the ability to receive ICE candidates, track the user's devices, and listen when a new track is added to a remote stream.

  4) To establish the connection via WebRTC, we need:
     i. Create an offer, set it as a local description, and then send it via WebSocket to another client.  
     ii. On the second client, we receive the description as an offer. We set it as a remote description, create an answer, set it as a local description, and send it via WebSocket to the first client.  
     iii. On the first client, we receive the description as an answer and set it as a remote description.  
     iv. After setting the remote descriptions, WebRTC will send ICE candidates to the clients via WebSocket. To establish a connection between the two clients, we need to add these candidates to the peer connection.  
     v. If everything goes well, the connection will be established, and clients will hear each other.
- Users can select their preferred input and output devices using the native HTML `<select>` element, which dynamically updates the media stream.


### Step 2: Audio Filters (Optional/Bonus)
- A frequency and gain filter was implemented using the Web Audio API. The gain is set to 0.75, and the frequency filter allows only frequencies between 0 and 200 Hz to pass through.
- A toggle feature allows users to enable or disable the filter in real-time without disrupting the audio stream. This was done by connecting audio nodes in the processing pipeline: `audioSource => gainNode => biquadFilter => destination`.
  1) This is implemented using the native `AudioContext`.  
  2) To implement such logic, we first need to create an audio context using `new AudioContext()`. After creating it, we need to create a gain node and a biquad filter node.  
  3) This can be done using methods such as `.createGain()` and `.createBiquadFilter()`.  
  4) After that, if the checkbox is checked, we set all the necessary filters and connect each node as follows: `audioSource => gainNode => biquadFilter => destination`.  
  5) After connecting all the nodes, we need to replace the current track with the filtered one.  
  6) To do so, we need to take the sender and replace its audio track using the `.replaceTrack()` method.


### Step 3: Audio Visualization (Advanced/Extra Credit)
- To visualize the audio stream, I used an `AnalyserNode` from the Web Audio API to capture the time-domain data. The waveform visualization is updated in real-time, reflecting the incoming audio signal.
- The visualization is rendered using plain Canvas API and AudioContext API, and the canvas is updated as audio data is streamed.
  1) We take the incoming audio and send it through the analyser, which we create from the audio context. We do this by connecting the analyser node to the audio: `audio => analyser => destination`.  
  2) We set all the necessary properties and create a data array from the audio.  
  3) We get the amplitude of a frequency bin by passing the data array through the `.getByteTimeDomainData()` method.

### Challenges Encountered

#### WebRTC and Audio Streaming
- Since it was my first time working with WebRTC, I faced challenges understanding the API and setting up peer-to-peer connections.
- To overcome this, I dove into the WebRTC API documentation and built a signaling system using WebSockets to ensure fast and reliable communication between clients to send/receive offers, answers, and ICE candidates.

#### Audio Filters & Visualization
- Implementing real-time audio filters was a new experience, requiring me to get familiar with the Web Audio API.
- I learned how to create audio nodes such as gain and biquad filters to manipulate the audio stream.
- I also used the AnalyserNode to process the audio data for real-time visualization.


### Conclusion
This project gave me knowledge of WebRTC and real-time audio processing, and I am confident that the knowledge I’ve gained will allow me to contribute to your team.
