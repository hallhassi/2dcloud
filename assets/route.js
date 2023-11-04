var js = document.createElement("script");
js.type = "text/javascript";

if (typeof productId == 'undefined') {
    js.src = indexScript;
} else  js.src = "";

document.body.appendChild(js);