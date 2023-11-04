var css = document.createElement("link")
css.rel = "stylesheet"
css.type = "text/css"
css.media = "all"
var js = document.createElement("script")
js.type = "text/javascript"

if (typeof productId == 'undefined') {
    css.href = indexCss
    js.src = indexScript
} else {
    css.href = listCss
    js.src = listScript
}

document.head.appendChild(css)
document.body.appendChild(js)