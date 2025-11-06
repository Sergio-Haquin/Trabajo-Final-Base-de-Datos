import {Cart} from '../models/cartModel.js'

export const cartCreate = async(user_id,items) => {
    const cart = new Cart(
        {
            user_id,
            items
        }
    )
    const newCart = await cart.save()
    return newCart
}