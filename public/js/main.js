import {
  showElement,
  hideElement,
  formatTime,
  disableElement,
  enableElement,
  renderAudioList,
  getSharedAudioBlob
} from './utils.js'


import  uuid  from '../utils/uuid/v4.js'

const query = window.location.search // obtiene la query de la url
const urlParams = new URLSearchParams(query) // crea un objeto con los parámetros de la query
const playMode = urlParams.get('play') // obtiene el valor del parámetro play

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
  uuid = null

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
    if (!localStorage.getItem('uuid')) {
      // si no está almacenado en localStorage
      localStorage.setItem('uuid', uuid()) // genera y gaurda el uuid
    }
    this.uuid = localStorage.getItem('uuid') // logra el uuid desde localStorage

    // Initialize the audio context
    this.initAudio()

    // Set the initial state
    if(playMode){
      // Get audio from server
      getSharedAudioBlob(playMode).then((blob) => {
        this.loadBlob(blob)
      })
      this.setState({ sharing: true })
    }

    console.log('App initialized')
  }

  initAudio() {
    // Create a new audio object
    const audio = new Audio()

    // Set the audio properties
    audio.onloadedmetadata = () => {}
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

  // Set the state
  setState(state) {
    // Update the state
    this.state = Object.assign({}, this.state, state)

    // Render DOM elements
    this.render()
  }

  render() {
    console.log(this.state)

    // Sharing state
    // When user is listening to shared audio
    if (this.state.sharing) {
      showElement(liPlayButton) // Show the play button
      hideElement(liRecordButton) // Hide the record button
      hideElement(liStopButton) // Hide the stop button
      hideElement(liUploadButton) // Hide the upload button
      hideElement(liStopRecordingButton) // Hide the stop recording button
    }

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

  upload() {
    this.setState({ uploading: true }) // estado actual: uploading
    const body = new FormData() // Mediante FormData podremos subir el audio al servidor
    body.append('recording', this.blob) // en el atributo recording de formData guarda el audio para su posterior subida
    fetch('/api/upload/' + this.uuid, {
      method: 'POST', // usaremos el método POST para subir el audio
      body,
    })
      .then((res) => res.json()) // el servidor, una vez recogido el audio, devolverá la lista de todos los ficheros a nombre del presente usuario (inlcuido el que se acaba de subir)
      .then((json) => {
        this.setState({
          files: json.files, // todos los ficheros del usuario
          uploading: false, // actualizar el estado actual
          uploaded: true, // actualizar estado actual
        })
      })
      .catch((err) => {
        this.setState({ error: true })
      })
  }
  deleteFile() {}

}


const app = new App()
app.init()

function loadAudioList() {
  fetch('/api/list/')
    .then((res) => res.json())
    .then((json) => {
    renderAudioList(json.files)
    })
    .catch((err) => {
      app.setState({ error: true })
    })
}

loadAudioList()