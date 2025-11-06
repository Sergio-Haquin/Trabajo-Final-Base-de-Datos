import {Product} from '../models/productModel.js'

export const productCreate = async(nombre,marca,descripcion,precio,categoria_id,stock) => {
    const product = new Product(
        {
            nombre,
            marca,
            descripcion,
            precio,
            categoria_id,
            stock
        }
    )
    const newProduct = await product.save()
    return newProduct
}