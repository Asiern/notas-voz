// import { recordButton } from './recordButton.js'

const liRecordButton = document.getElementById('li-record-button')
liRecordButton.addEventListener('click', () => {
  app.record()
})

const liStopRecordingButton = document.getElementById('li-stop-button')
liStopRecordingButton.addEventListener('click', () => {
  app.stopRecording()
})
// liRecordButton.innerHTML = recordFn()

class App {
  blob = null
  audio = null
  state = {} // playing, recording, uploaded, deleting
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
    audio.onended = () => {}
    audio.ontimeupdate = () => {
      this.setState('playing')
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
    }

    // Set the recorder object
    this.recorder = recorder
  }

  setState(state) {
    this.state = Object.assign({}, this.state, state)
    this.render()
  }

  render() {
    switch (this.state) {
      case 'playing':
        break
      default:
        console.error(`State ${this.state} not found`)
    }
  }

  record() {
    // Start recording
    this.recorder.start()
  }

  stopRecording() {
    console.log('Stopping recording...')
    // Stop recording
    if (this.recorder && this.recorder.state !== 'inactive')
      this.recorder.stop()
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
