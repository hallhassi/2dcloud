const currentProduct = Array.from(items).find(item => item.dataset.id == productId)
const cartHeight = cart.getBoundingClientRect().height
const productLocation = currentProduct.scrollTop
const scrollTo = productLocation - cartHeight
currentProduct.open = true
window.scrollTo(0, scrollTo)