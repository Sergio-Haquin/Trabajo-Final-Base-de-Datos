import mongoose from 'mongoose'

const categoryModel = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true
        },
        descripcion: {
            type: String,
            required: true
        },
        productos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ]
    }
)

export const Category = mongoose.model('Category', categoryModel)