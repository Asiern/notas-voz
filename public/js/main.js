import { showElement, hideElement, formatTime } from './utils.js'

const liRecordButton = document.getElementById('li-record-button')
liRecordButton.addEventListener('click', () => {
  app.record()
})

const liStopRecordingButton = document.getElementById('li-stop-record-button')
liStopRecordingButton.addEventListener('click', () => {
  app.stopRecording()
})

const liPlayButton = document.getElementById('li-play-button')
liPlayButton.addEventListener('click', () => {
  app.playAudio()
})

const playButtonTimer = document.getElementById('play-button-timer')
const liStopButton = document.getElementById('li-stop-button')
liStopButton.addEventListener('click', () => {
  if (app.state === 'playing') app.stopAudio()
  else app.playAudio()
})

const liStopButtonText = document.getElementById('li-stop-button-text')

const liUploadButton = document.getElementById('li-upload-button')
liUploadButton.addEventListener('click', () => {
  // TODO: Upload the audio
})

class App {
  blob = null
  audio = null
  state = 'inactive' // playing, recording, uploaded, deleting
  audioChunks = []
  recorder = null

  constructor() {
    this.init()
  }

  init() {
    console.log('Initializing app...')

    // Ask for permission to use the microphone
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Initialize the recorder
      console.log('Initializing recorder...')
      this.initRecord(stream)
    })

    // Initialize the audio context
    this.initAudio()

    console.log('App initialized')
  }

  initAudio() {
    // Create a new audio object
    const audio = new Audio()

    // Set the audio properties
    audio.onloadedmetadata = () => {}
    audio.onended = () => {
      console.log('Audio ended')
      this.setState('inactive')
    }
    audio.ontimeupdate = (e) => {
      // Show the current time in play button
      playButtonTimer.innerText = `${formatTime(
        e.target.currentTime
      )} / ${formatTime(e.target.duration)}`
    }
    audio.ondurationchange = () => {}

    // Set the audio object
    this.audio = audio
  }

  loadBlob(blob) {
    // Create a new URL for the blob
    const audioUrl = URL.createObjectURL(blob)
    this.audio.src = audioUrl
    // Link the audio object to the blob
    const audioPlayer = document.getElementById('audio-player')
    audioPlayer.src = audioUrl
  }

  initRecord(stream) {
    // Create a new media recorder
    const recorder = new MediaRecorder(stream)

    // Set the recorder properties
    recorder.ondataavailable = (e) => {
      this.audioChunks.push(e.data)
    }
    recorder.onstop = () => {
      // Get the blob
      const blob = new Blob(this.audioChunks, { type: 'audio/wav' })
      this.loadBlob(blob)
      this.audioChunks = []
    }

    // Set the recorder object
    this.recorder = recorder
  }

  setState(state) {
    this.state = state //Object.assign({}, this.state, state)
    this.render()
  }

  render() {
    console.log(this.state)
    switch (this.state) {
      case 'inactive':
        // Hide stop, stoprecording buttons
        hideElement(liStopButton)
        hideElement(liStopRecordingButton)
        // Show record, play buttons
        showElement(liRecordButton)
        showElement(liPlayButton)
        break
      case 'playing':
        // Hide play button
        hideElement(liPlayButton)
        // Show stop button
        showElement(liStopButton)
        // Set stop button text to 'Stop'
        liStopButtonText.innerText = 'Stop'
        break
      case 'recording':
        // Hide record button
        hideElement(liRecordButton)
        // Show stoprecording button
        showElement(liStopRecordingButton)
        break
      case 'stopped':
        // Set stop button text to 'Resume'
        liStopButtonText.innerText = 'Resume'
        break
      default:
        console.warn(`State ${this.state} not found`)
    }
  }

  record() {
    // Start recording
    this.recorder.start()
    this.setState('recording')
  }

  stopRecording() {
    console.log('Stopping recording...')
    // Stop recording
    if (this.recorder && this.recorder.state !== 'inactive')
      this.recorder.stop()

    this.setState('inactive')
  }

  playAudio() {
    this.setState('playing')
    this.audio.play()
  }
  stopAudio() {
    this.setState('stopped')
    this.audio.pause()
  }
  uploadAudio() {}
  deleteFile() {}
}

const app = new App()
app.init()
