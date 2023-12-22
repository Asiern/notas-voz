import {
  showElement,
  hideElement,
  formatTime,
  disableElement,
  enableElement,
  renderAudioList,
  getSharedAudioBlob
} from './utils.js'

const DEBUG = true

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
  // Upload the audio
  app.upload()
})

const liLogoutButton = document.getElementById('li-logout-button')
liLogoutButton.addEventListener('click', () => {
  // Logout
  fetch('/users/logout', {
    method: 'POST',
  })
    .then((res) => {
      if (res.status !== 200) {
        console.log('Hubo un problema al cerrar sesión')
        return
      }
      window.location.href = '/login'
    })
    .catch((err) => {
      DEBUG && console.log(err)
      app.setState({ error: true })
    })
})
if (playMode) {
  hideElement(liLogoutButton)
}


const audioListElement = document.getElementById('audio-list')
const user = document.getElementById('li-user-id').innerText

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
    DEBUG && console.log('Initializing app...')

    // Ask for permission to use the microphone
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Initialize the recorder
      DEBUG && console.log('Initializing recorder...')
      this.initRecord(stream)
    })

    // Set the user id
    this.uuid = user
    if (!window.localStorage.getItem('uuid')) {
      window.localStorage.setItem('uuid', this.uuid)
    }

    // Initialize the audio context
    this.initAudio()

    // Set the initial state
    if (playMode) {
      DEBUG && console.log('Play mode ON, getting shared audio...')
      // Get audio from server
      getSharedAudioBlob(playMode).then((blob) => {
        DEBUG && console.log(blob)

        this.loadBlob(blob)
      }, (err) => {
        console.error(err)
        // Snackbar to show the error
        Snackbar.show({ text: err, actionTextColor: '#EF4444' })

        setTimeout(() => {
          // Redirect to home
          document.location.href = "/";
        }, 3000)
      })
      this.setState({ sharing: true, playing: false, recording: false })
    }

    DEBUG && console.log('App initialized')
  }

  initAudio() {
    // Create a new audio object
    const audio = new Audio()

    // Set the audio properties
    audio.onloadedmetadata = () => { }
    audio.onended = () => {
      DEBUG && console.log('Audio ended')
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

    this.blob = blob
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
    DEBUG && console.log(this.state)

    // Sharing state
    // When user is listening to shared audio
    if (this.state.sharing) {
      console.log("Sharing")
      showElement(liPlayButton) // Show the play button
      hideElement(liRecordButton) // Hide the record button
      hideElement(liStopButton) // Hide the stop button
      hideElement(liUploadButton) // Hide the upload button
      hideElement(liStopRecordingButton) // Hide the stop recording button
      hideElement(audioListElement) // Hide the audio list
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
    if (!this.state.recording && !this.state.sharing) {
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
    body.append('recording', this.blob) // añadimos el audio al FormData

    if (!this.blob) {
      DEBUG && console.log('No blob')
      return
    }

    fetch('/api/upload/' + this.uuid, {
      method: 'POST', // usaremos el método POST para subir el audio
      body,
    })
      .then((res) => res.json()) // el servidor, una vez recogido el audio, devolverá la lista de todos los ficheros a nombre del presente usuario (inlcuido el que se acaba de subir)
      .then((json) => {
        console.log(json)
        this.setState({
          files: json.files, // todos los ficheros del usuario
          uploading: false, // actualizar el estado actual
          uploaded: true, // actualizar estado actual
        })
        loadAudioList(json.files) // volver a cargar la lista de audios
      })
      .catch((err) => {
        DEBUG && console.log(err)
        this.setState({ error: true })
      })
  }

  deleteFile() { }

}


const app = new App()
app.init()

// Function to load the audio 
// list by fetching the API 
// and rendering the list
function loadAudioList() {
  fetch(`/api/list/${app.uuid}`)
    .then((res) => res.json())
    .then((json) => {
      DEBUG && console.log("Audio")
      DEBUG && console.log(json)
      renderAudioList(json)
    })
    .catch((err) => {
      DEBUG && console.log(err)
      app.setState({ error: true })
    })
}

// Load the audio list if not in sharing mode
loadAudioList()