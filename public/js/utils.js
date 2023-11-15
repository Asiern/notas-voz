function hideElement(e) {
  e.setAttribute('class', e.getAttribute('class') + ' hidden')
}

function showElement(e) {
  e.setAttribute('class', e.getAttribute('class').replaceAll('hidden', ''))
}

function formatTime(seconfs) {
  const minutes = Math.floor(seconfs / 60)
  let seconds = seconfs - minutes * 60
  // Format seconds as integer
  seconds = Math.round(seconds)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export { hideElement, showElement, formatTime }
