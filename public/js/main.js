import { showElement, hideElement, formatTime, disableElement, enableElement } from './utils.js'

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
  if (app.state.playing) app.stopAudio()
  else app.playAudio()
})

const liUploadButton = document.getElementById('li-upload-button')
liUploadButton.addEventListener('click', () => {
  // TODO: Upload the audio
})

class App {
  blob = null
  audio = null
  state = {}
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
    audio.onloadedmetadata = () => { }
    audio.onended = () => {
      console.log('Audio ended')
      this.setState({ playing: false })
    }
    audio.ontimeupdate = (e) => {
      // Show the current time in play button
      playButtonTimer.innerText = `${formatTime(
        e.target.currentTime
      )} / ${formatTime(e.target.duration)}`
    }
    audio.ondurationchange = () => { }

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

  // Set the state
  setState(state) {
    // Update the state
    this.state = Object.assign({}, this.state, state)

    // Render DOM elements
    this.render()
  }

  render() {
    console.log(this.state)
    // Play state
    if (this.state.playing) {
      hideElement(liPlayButton) // Hide the play button
      showElement(liStopButton) // Show the stop button
    }

    // Not playing state
    if (!this.state.playing) {
      showElement(liPlayButton) // Show the play button
      hideElement(liStopButton) // Hide the stop button
    }

    // Recording state
    if (this.state.recording) {
      hideElement(liRecordButton) // Hide the record button
      showElement(liStopRecordingButton) // Show the stop recording button
      disableElement(liPlayButton)
      disableElement(liStopButton)
    }

    // Not recording state
    if (!this.state.recording) {
      showElement(liRecordButton) // Show the record button
      hideElement(liStopRecordingButton) // Hide the stop recording button
      enableElement(liPlayButton) // Enable the play button
      enableElement(liStopButton) // Enable the stop button
    }
  }

  /**
   * Record the audio
   */
  record() {
    // If the audio is playing, stop it
    this.setState({ playing: false })
    this.audio.pause()

    // Set the state to recording
    this.setState({ recording: true })

    // Start recording
    this.recorder.start()
  }

  /**
   * Stop recording the audio
   */
  stopRecording() {
    // Stop recording
    if (this.recorder && this.recorder.state !== 'inactive')
      this.recorder.stop()

    this.setState({ recording: false })
  }

  /**
   * Play the audio
   */
  playAudio() {
    // If the audio is recording, stop it
    if (this.state.recording) this.stopRecording()
    this.setState({ recording: false })

    // Set the state to playing
    this.setState({ playing: true })

    // Play the audio
    this.audio.play()
  }

  /**
   * Stop the audio
   */
  stopAudio() {
    // Set the state to not playing
    this.setState({ playing: false })

    // Pause the audio
    this.audio.pause()
  }

  uploadAudio() { }
  deleteFile() { }
}

const app = new App()
app.init()
