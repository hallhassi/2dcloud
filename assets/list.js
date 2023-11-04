const currentProduct = imgArray.find(img => img.productId == productId)
currentProduct.open = true
currentProduct.scrollIntoView({ behavior: "instant"});