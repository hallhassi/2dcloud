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

if (history.state) storedHandle = history.state.handle

// click on item

document.body.addEventListener('click', (e) => {
    if (e.target == e.currentTarget) closeDetails()
})

Array.from(summaries).forEach(summary => {
    summary.addEventListener('click', (e) => {
        e.preventDefault()
        const parent = e.currentTarget.parentNode
        console.log(e.currentTarget, parent.open);
        if (parent.open == true) parent.open = false
        else if (parent.open == false) {
            closeDetails()
            parent.open = true
        }
        if (parent.dataset?.handle) pushState(parent.dataset.handle)
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
