
const added = document.getElementsByClassName('added')
const items = document.querySelectorAll('.item')
const cart = document.querySelector('#cart')
const header = document.querySelector('header')
const display = document.querySelector('#display')
const spacer = document.querySelector('#spacer')
const total = cart.querySelector('#total')
const buys = Array.from(document.querySelectorAll('.buy'))
const qtys = Array.from(document.querySelectorAll('.qty'))
const checkbox = document.getElementById('checkbox')
const stylesheet = document.querySelector(`link[rel='stylesheet'].switch`)
const summaries = Array.from(document.querySelectorAll('summary'))
const details = Array.from(document.querySelectorAll('details'))
const canvas = document.querySelector('canvas#canvas')
const context = canvas.getContext("2d")
const windowHeight = window.innerHeight
const documentHeight = document.documentElement.scrollHeight
const scrollableHeight = documentHeight - windowHeight
const closeItems = () => Array.from(items).forEach(item => item.open = false)
let previousItemIndex, previousImage
let storedHandle
let clearCode, firstPass = true
const fontSize = parseInt(window.getComputedStyle(header).fontSize)
const minTextWidth = 16 * fontSize



const scrollStep = 25
spacer.style.height = items.length * scrollStep + document.documentElement.clientHeight + 'px'
const initialOffset = window.scrollY + header.getBoundingClientRect().top


// build array

const imgArray = []
Array.from(items).forEach((item, index) => {
    Array.from(item.querySelectorAll('img')).forEach(img => {
        img.index = index
        imgArray.push(img)
    })
})


window.addEventListener('scroll', onScrub, { passive: true });
function onScrub() {
    draw()
}

function draw() {
    const imgIndex = Math.floor((window.scrollY - initialOffset) / scrollStep)
    const img = imgArray[imgIndex]
    const itemIndex = img.index
    items.forEach(item => item.classList.remove('vis'))
    items[itemIndex].classList.add('vis')
    if (img !== undefined && img.complete) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
        canvas.style.top = Math.floor((window.innerHeight - canvas.getBoundingClientRect().height) / 2) + 'px'
        const spaceForDetails = window.innerWidth - canvas.getBoundingClientRect().width
        if (spaceForDetails > minTextWidth) {
            items[itemIndex].style.width = `${spaceForDetails}px`
            cart.style.width = `${spaceForDetails}px`
        }
        console.log(`${spaceForDetails} ${imgArray.length}[${imgIndex}] ${window.scrollY}`)
    }
}





// '/product/[...]'

if (typeof productid !== 'undefined') {
    Array.from(items).forEach((item, i) => {
        if (item.dataset.id == productid) {
            window.scrollTo(0, (i / items.length * scrollableHeight) + 1)
            pushState(item.dataset.handle)
        }
    })
}


// checkbox

checkbox.addEventListener('change', checkboxFunction)
if (window.location.pathname == '/list') checkbox.click();
function checkboxFunction() {
    if (checkbox.checked) {
        window.addEventListener('scroll', scroll)
        stylesheet.href = checkbox.dataset.scroll
    }
    else {
        window.removeEventListener('scroll', scroll)
        stylesheet.href = checkbox.dataset.list
    }
}


// scroll




// scroll()
// window.addEventListener('scroll', scroll, { passive: true })

// function scroll() {
//     const scrolledHeight = document.documentElement.scrollTop
//     const percentScrolled = Math.min((scrolledHeight / scrollableHeight), .9999)
//     const currentItemIndexFloat = items.length * percentScrolled
//     const currentItemIndex = Math.floor(currentItemIndexFloat)
//     const currentImages = Array.from(items[currentItemIndex].querySelectorAll('img'))
//     const currentImageIndex = Math.floor(currentImages.length * (currentItemIndexFloat - currentItemIndex))
//     const currentImage = currentImages[currentImageIndex]
//     if (previousItemIndex !== currentItemIndex) {
//         previousItemIndex = currentItemIndex
//         items.forEach(item => item.classList.remove('vis'))
//         items[currentItemIndex].classList.add('vis')
//         closeItems()
//     }
//     if (previousImage != currentImage) {
//         previousImage = currentImage
//         canvas.width = currentImage.naturalWidth
//         canvas.height = currentImage.naturalHeight
//         context.drawImage(currentImage, 0, 0, currentImage.naturalWidth, currentImage.naturalHeight)
//         canvas.style.top = Math.floor((window.innerHeight - canvas.getBoundingClientRect().height) / 2) + 'px'
//     }
// }

// if (clearCode != undefined) clearInterval(clearCode)
// else clearCode = setInterval(scroll, 500)



// pushstate and close items

window.addEventListener('click', (e) => {
    if (history.state) storedHandle = history.state.handle
    if (e.target.parentNode?.parentNode?.open == false &&
        e.target.parentNode.parentNode.dataset?.handle !== storedHandle &&
        e.target.tagName !== 'BUTTON') {
        pushState(e.target.parentNode.parentNode.dataset.handle)
        closeItems()
    } else if (e.target.tagName == 'BODY') closeItems()
})

function pushState(handle) {
    history.pushState({ 'handle': handle }, '', `/products/${handle}`)
    document.title = '2dcloud/' + handle;
}


// update Cart and Total

function updateCart() {
    added.length > 0 ? show(cart) : hide(cart)
    let addedtocart = cart.querySelectorAll('.added')
    total.innerText = "$" + Math.round(Array.from(addedtocart).reduce((p, c) => p + parseInt(c.dataset.price) * c.parentNode.querySelector('.qty').value, 0) / 100)
}

// toggle Item

function toggleItem(id) {
    let ids = Array.from(document.querySelectorAll(`[data-id='${id}']`))
    ids.forEach(id => {
        let inCart = id.parentNode.querySelector('.qty')
        id.classList.toggle('added')
        if (id.classList.contains('added')) {
            id.innerText = "remove"
            if (inCart) show(id.parentNode)
        } else {
            id.innerText = "buy"
            if (inCart) {
                hide(id.parentNode)
                id.parentNode.querySelector('.qty').value = 1
            }
        }
    })
}

// buy/remove

buys.forEach(a => {
    a.addEventListener('click', function (e) {
        let id = e.target.dataset.id, route, body
        if (e.target.classList.contains('added')) {
            route = 'change'
            body = `{"id": "${id}", "quantity": 0}`
        } else {
            route = 'add'
            body = `{"items": [{"id": ${id},"quantity": 1}]}`
        }
        toggleItem(id)
        updateCart()
        fetch(window.Shopify.routes.root + `cart/${route}.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        }).catch((error) => { console.error('Error:', error) })
    })
})

// qtys

qtys.forEach(a => {
    a.addEventListener("keydown", function (e) { if (e.key == 'Enter') a.blur() })
    a.addEventListener('blur', function (e) {
        let id = e.target.parentNode.querySelector('.buy').dataset.id, qty
        qty = e.target.value == '' ? 0 : parseInt(e.target.value)
        if (qty == 0) {
            toggleItem(id)
            e.target.value = 1
        }
        updateCart()
        fetch(window.Shopify.routes.root + 'cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: `{"id": "${id}", "quantity": ${qty}}`
        }).catch((error) => { console.error('Error:', error) })
    })
})

// change Qty

function changeQty(id, qty) {
    let q = cart.querySelector(`[data-id='${id}']`)
    q.parentNode.querySelector('.qty').value = qty
}

// fetch

fetch('/cart.js', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    .then((response) => response.json())
    .then((data) => {
        data.items.forEach(function (item) {
            toggleItem(item.id)
            changeQty(item.id, item.quantity)
        })
        updateCart()
    }).catch((error) => { console.error('Error:', error); });

// show hide

function show(a) {
    a.classList.remove('hidden')
    a.hidden = false
}

function hide(a) {
    a.classList.add('hidden')
    a.hidden = true
}

function toggle(a) {
    a.hidden ? show(a) : hide(a)
}
