import mongoose from 'mongoose'
import Estado from '../enums/estado.js'
import MetodoPago from '../enums/metodoPago.js'

const orderModel = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fecha: { type: Date, required: true },
        estado: { type: String, enum: Estado, required: true },
        productos: [
            {
                producto_id: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                cantidad: { type: Number, required: true, min: 1 },
                subtotal: { type: Number, required: true, min: 0 }
            }
        ],
        metodoDePago: { type: String, enum: MetodoPago, required: true },
        total: { type: Number, required: true, min: 0 },
    }
)

export const Order = mongoose.model('Order', orderModel)