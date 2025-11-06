import mongoose from 'mongoose'

const productModel = mongoose.Schema(
    {
        nombre: { type: String, required: true },
        marca: { type: String, required: true },
        descripcion: { type: String, required: true },
        precio: { type: Number, required: true, min: 0 },
        categoria_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        stock: { type: Number, required: true, min: 0 },
        reseñas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Review'
            }
        ]
    }
)

export const Product = mongoose.model('Product', productModel)
