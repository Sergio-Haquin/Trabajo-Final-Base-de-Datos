import mongoose from 'mongoose'

const cartModel = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [
            {
                producto_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                cantidad: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ]
    }
)

export const Cart = mongoose.model('Cart', cartModel)