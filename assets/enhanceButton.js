let enhanced = false
const enhancedButton = document.querySelector('#enhance')

enhancedButton.addEventListener('click', enhance)

function enhance() {    

  const link = document.createElement("link")
  const script = document.createElement("script")
  link.rel = "stylesheet"
  link.type = "text/css"
  link.media = "all"
  script.type = "text/javascript"

  if (enhanced == false) {
    script.src = enhanceJs
    link.classList.add("enhance")
    script.classList.add("enhance")
    link.href = enhanceCss
    enhanced = true
    enhancedButton.innerHTML = 'unenhance'
  } else {
    script.src = unenhanceJs
    enhanced = false
    enhancedButton.innerHTML = 'enhance'
    Array.from(document.querySelectorAll('.enhance')).forEach(e => e.remove())
  }
  document.head.appendChild(link)
  document.body.appendChild(script)
}