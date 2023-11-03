
// checkbox

checkbox.addEventListener('change', checkboxFunction)
if (window.location.pathname == '/list') checkbox.click();
function checkboxFunction() {
    if (checkbox.checked) {
        window.addEventListener('scroll', draw, { passive: true })
        stylesheet.href = checkbox.dataset.scroll
        spacer.style.display = 'inherit'
    } else {
        window.removeEventListener('scroll', draw, { passive: true })
        stylesheet.href = checkbox.dataset.list
        spacer.style.display = 'none'
        details.forEach(d => d.style = "")
    }
}
