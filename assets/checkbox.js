
{/* <input
id="checkbox"
checked
type="checkbox"
data-scroll="{{ 'scroll.css' | asset_url}}"
data-list="{{ 'list.css' | asset_url}}">
<div id="svg"> */}
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
