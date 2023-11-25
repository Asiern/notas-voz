import { URL } from './constants.js'
import moment from '../utils/moment/moment.js'
moment.locale('es')

function hideElement(e) {
  e.setAttribute('class', e.getAttribute('class') + ' hidden')
}

function showElement(e) {
  e.setAttribute('class', e.getAttribute('class').replaceAll('hidden', ''))
}

function disableElement(e) {
  e.setAttribute('disabled', '')
}

function enableElement(e) {
  e.removeAttribute('disabled')
}

function formatTime(s) {
  const minutes = Math.floor(s / 60)
  let seconds = s - minutes * 60
  // Format seconds as integer
  seconds = Math.round(seconds)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

function createIconFromInnerHtml(innerHtml) {
  const icon = document.createElement('div')
  icon.innerHTML = innerHtml
  return icon
}

function renderAudioList(audioList) {
  // Get the audio list element
  const audioListElement = document.getElementById('audio-list')
  // Clear the audio list
  audioListElement.innerHTML = ''
  // Iterate over the audio list
  audioList.forEach((audio) => {
    // Create the audio container
    const container = document.createElement('div')
    container.setAttribute(
      'class',
      'flex justify-between items-center flex-row bg-gray-100 p-2 rounded-md mb-2 my-2 px-4'
    )

    // Create the audio name element
    const filenameContainer = document.createElement('div')
    filenameContainer.onclick = () => {
      // Copy the audio url to the clipboard
      navigator.clipboard.writeText(`${URL}/play/${audio.filename}`)
    }
    filenameContainer.setAttribute(
      'class',
      'flex flex-row items-center gap-2 hover:text-gray-700 cursor-pointer p-2 truncate'
    )
    const icon = createIconFromInnerHtml(
      '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /></svg>'
    )
    const filename = document.createElement('span')
    filename.setAttribute('class', 'text-sm font-montserrat')
    filename.innerHTML = audio.filename
    filenameContainer.appendChild(icon)
    filenameContainer.appendChild(filename)

    // Create the audio date element
    const date = document.createElement('span')
    date.setAttribute('class', 'text-xs font-montserrat mx-2')
    const dateString = moment(audio.date).calendar().toLocaleLowerCase() + ' - ' + moment(audio.date).format('LT')
    date.innerHTML = dateString

    // Create the audio delete element
    const deleteContainer = document.createElement('div')
    deleteContainer.setAttribute(
      'class',
      'flex flex-row items-center gap-2 hover:bg-red-700 rounded-md hover:text-white p-2 transition-colors cursor-pointer'
    )
    const deleteIcon = createIconFromInnerHtml(
      '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>'
    )
    deleteContainer.appendChild(deleteIcon)
    deleteContainer.onclick = () => {
      const uuid = localStorage.getItem('uuid')

      if (!uuid) {
        alert('You need to login first')
        return
      }

      // TODO Delete the audio
      fetch(`${URL}/delete/${uuid}/${audio.filename}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            // TODO Re render the audio list
          }
        })
        .catch((err) => {
          console.log(err)
          alert('Something went wrong')
        })
    }

    // Append the elements to the container
    container.appendChild(filenameContainer)
    container.appendChild(date)
    container.appendChild(deleteContainer)

    // Append the container to the audio list
    audioListElement.appendChild(container)
  })
}

export {
  hideElement,
  showElement,
  formatTime,
  disableElement,
  enableElement,
  renderAudioList,
}
