const added = document.getElementsByClassName('added')
const items = document.querySelectorAll('.item')
const cart = document.querySelector('#cart')
const main = document.querySelector('main')
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
const closeDetails = () => Array.from(details).forEach(item => item.open = false)
const closeCart = () => cart.open = false
let previousItemIndex, previousImgIndex
let storedHandle
const fontSize = parseInt(window.getComputedStyle(main).fontSize)
const minTextWidth = 12 * fontSize


// build array

const imgArray = []
let i = 0
Array.from(items).forEach((item, itemIndex) => {
    Array.from(item.querySelectorAll('img')).forEach((img) => {
        img.itemIndex = itemIndex
        img.imgIndex = i
        img.productId = item.dataset.id
        img.handle = item.dataset.handle
        imgArray.push(img)
        i += 1
    })
})

//make images smaller

imgArray.forEach(img => img.src = img.src.replace('2048x2048', '900x900'))


// set window height ...

const scrollStep = 25
spacer.style.height = imgArray.length * scrollStep + document.documentElement.clientHeight + 'px'

// and window height dependent variables 

const initialOffset = window.scrollY + main.getBoundingClientRect().top
let imgIndex = Math.floor((window.scrollY - initialOffset) / scrollStep)
const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight


// routing

const img = typeof productId == 'number' ? imgArray.find(img => img.productId == productId) : imgArray[0]
img.addEventListener("load", handleLoad)
window.scrollTo({ top: (img.imgIndex / imgArray.length * scrollableHeight) + initialOffset + 1, behavior: 'instant' })

function handleLoad() {
    console.log('loadhandling ' + this.imgIndex);
    imgIndex = this.imgIndex
    pushState(imgArray[imgIndex].handle)
    draw()
    console.log('loadhandled ' + this.imgIndex);
}


// scroll

window.addEventListener('scroll', draw, { passive: true });
window.addEventListener('resize', draw);

function draw() {
    imgIndex = window.scrollY - initialOffset <= 0 ? 0 : Math.floor((window.scrollY - initialOffset) / scrollStep)
    const img = imgArray[imgIndex]
    const itemIndex = img?.itemIndex
    console.log(imgIndex, window.scrollY - initialOffset);
    console.log(previousItemIndex, itemIndex, previousItemIndex != itemIndex, img !== undefined , img.complete , previousImgIndex != imgIndex)
    if (previousItemIndex != itemIndex) {
        previousItemIndex = itemIndex
        items.forEach(item => item.classList.remove('vis'))
        items[itemIndex]?.classList.add('vis')
        details.forEach(details => details.open = false)
    }
    if (img !== undefined && img.complete && previousImgIndex != imgIndex) {
        previousImgIndex = imgIndex
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        console.log(`drawing ${imgArray.length}[${imgIndex}]`)
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
    }
}



if (history.state) storedHandle = history.state.handle

// click on item

document.body.addEventListener('click', (e) => {
    if (e.target == e.currentTarget) closeDetails()
})

Array.from(summaries).forEach(summary => {
    summary.addEventListener('click', (e) => {
        console.log(e.currentTarget, e.currentTarget.parentNode.open);
        if (e.currentTarget.open == true) e.currentTarget.open = false
        if (e.currentTarget.parentNode.dataset?.handle) {
                closeDetails()
                pushState(e.currentTarget.parentNode.dataset.handle)
            } 
        else if (e.currentTarget.parentNode.id == 'cart' && document.body.querySelector('.item[open]')) closeDetails()
    })
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
