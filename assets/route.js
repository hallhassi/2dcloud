var css = document.createElement("link")
css.rel = "stylesheet"
css.type = "text/css"
css.media = "all"
var js = document.createElement("script")
js.type = "text/javascript"

if (typeof productId == 'undefined') {
    js.src = indexScript
    css.src = indexCss
} else {
    css.src = listCss
    js.src = ""
}

document.head.appendChild(css)
document.body.appendChild(js)