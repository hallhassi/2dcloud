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
const closeItems = () => Array.from(items).forEach(item => item.open = false)
let previousItemIndex, previousImgIndex
let storedHandle
let clearCode, firstPass = true
let productId = undefined
const fontSize = parseInt(window.getComputedStyle(header).fontSize)
const minTextWidth = 12 * fontSize


// build array

const imgArray = []
Array.from(items).forEach((item, itemIndex) => {
    Array.from(item.querySelectorAll('img')).forEach((img, imgIndex) => {
        img.itemIndex = itemIndex
        img.imgIndex = imgIndex
        img.productId = item.dataset.id
        img.handle = item.dataset.handle
        imgArray.push(img)
    })
})


// set window height ...

const scrollStep = 25
spacer.style.height = imgArray.length * scrollStep + document.documentElement.clientHeight + 'px'

// and window height dependent variables 

const initialOffset = window.scrollY + header.getBoundingClientRect().top
let imgIndex = Math.floor((window.scrollY - initialOffset) / scrollStep)
const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight


// routing

if (typeof productid == 'number') {
    imgArray.forEach((img, i) => {
        if (img.productId == productid) {
            img.addEventListener("load", handleLoad)
            return
        }
    })
} else imgArray[0].addEventListener("load", handleLoad)

function handleLoad() {
    imgIndex = this.imgIndex
    window.scrollTo({top: (imgIndex / imgArray.length * scrollableHeight) + 1, behavior: 'instant'})
    pushState(imgArray[imgIndex].handle)
    draw()
}


// scroll

window.addEventListener('scroll', draw, { passive: true });
window.addEventListener('resize', draw);

function draw() {
    imgIndex = Math.floor((window.scrollY - initialOffset) / scrollStep)
    const img = imgArray[imgIndex]
    const itemIndex = img.itemIndex
    if (previousItemIndex != itemIndex) {
        previousItemIndex = itemIndex
        items.forEach(item => item.classList.remove('vis'))
        items[itemIndex].classList.add('vis')
    }
    if (img !== undefined && img.complete && previousImgIndex != imgIndex) {
        previousImgIndex = imgIndex
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
        canvas.style.top = Math.floor((window.innerHeight - canvas.getBoundingClientRect().height) / 2) + 'px'
        const spaceForDetails = (window.innerWidth - canvas.getBoundingClientRect().width) / 2
        if (spaceForDetails > minTextWidth) {
            items[itemIndex].style.width = `${spaceForDetails}px`
            cart.style.width = `${spaceForDetails}px`
        } else {
            items[itemIndex].style.width = 'auto'
            cart.style.width = 'auto'
        }
        console.log(`${spaceForDetails} ${imgArray.length}[${imgIndex}] ${window.scrollY}`)
    }
}


// checkbox

checkbox.addEventListener('change', checkboxFunction)
if (window.location.pathname == '/list') checkbox.click();
function checkboxFunction() {
    if (checkbox.checked) {
        window.addEventListener('scroll', scroll)
        stylesheet.href = checkbox.dataset.scroll
        spacer.style.display = 'initial'
    } else {
        window.removeEventListener('scroll', scroll)
        stylesheet.href = checkbox.dataset.list
        spacer.style.display = 'none'
    }
}


// click on item

window.addEventListener('click', (e) => {
    if (history.state) storedHandle = history.state.handle
    if (e.target.parentNode.dataset?.handle !== storedHandle) {
        pushState(e.target.parentNode.dataset.handle)
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
