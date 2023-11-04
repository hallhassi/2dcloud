let enhanced = false
const enhancedButton = document.querySelector('#enhance')

enhancedButton.addEventListener('click', enhance)

function enhance() {    
  const css = document.createElement("link")
  const js = document.createElement("script")
  css.rel = "stylesheet"
  css.type = "text/css"
  css.media = "all"
  css.classList.add("enhance")
  css.href = enhanceCss
  js.type = "text/javascript"
  js.classList.add("enhance")
  if (enhanced == false) {
    js.src = enhanceJs
    enhanced = true
    enhancedButton.innerHTML = 'unenhance'
  } else {
    js.src = unenhanceJs
    enhanced = false
    enhancedButton.innerHTML = 'enhance'
    Array.from(document.querySelectorAll('.enhance')).forEach(e => e.remove())
  }
  document.head.appendChild(css)
  document.body.appendChild(js)
}