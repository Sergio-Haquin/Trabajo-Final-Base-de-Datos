import {Order} from '../models/orderModel.js'

export const orderCreate = async(user_id,fecha,estado,productos,metodoDePago,total) => {
    const order = new Order(
        {
            user_id,
            fecha,
            estado,
            productos,
            metodoDePago,
            total
        }
    )
    const newOrder = await order.save()
    return newOrder
}