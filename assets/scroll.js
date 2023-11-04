

// set window height ...

const scrollStep = 25
spacer.style.height = imgArray.length * scrollStep + document.documentElement.clientHeight + 'px'

// and window height dependent variables 

const initialOffset = header.getBoundingClientRect().height
console.log(initialOffset);
let imgIndex = Math.max(0, Math.floor((window.scrollY - initialOffset) / scrollStep))
const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight


// init

const initialImg = imgArray[0]
initialImg.addEventListener("load", route)

function route() {
    console.log('loaded ' + initialImg.imgIndex);
    if (initialImg != imgArray[0]) {
        console.log('routing ' + this.imgIndex);
        window.scrollTo({ top: (initialImg.imgIndex / imgArray.length * scrollableHeight) + initialOffset + 1, behavior: 'instant' })
        imgIndex = this.imgIndex
        pushState(imgArray[imgIndex].handle)
    }
    draw()
}

// scroll

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleResize);

function handleScroll() {
    console.log('scrolling from ' + window.scrollY + ', ' + imgIndex);
    draw()
}
function handleResize() {
    console.log('resizing');
    draw()
}

function draw() {
    imgIndex = Math.max(0, Math.floor((window.scrollY - initialOffset) / scrollStep))
    const img = imgArray[imgIndex]
    const itemIndex = img?.itemIndex
    console.log(imgIndex, window.scrollY - initialOffset);
    console.log(previousItemIndex, itemIndex, previousItemIndex != itemIndex, img !== undefined, img.complete, previousImgIndex != imgIndex)
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


