const currentProduct = items.find(item => item.dataset.id == productId)
currentProduct.open = true
currentProduct.scrollIntoView({ behavior: "instant"});