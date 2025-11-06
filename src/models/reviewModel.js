import mongoose from 'mongoose'

const reviewModel = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        producto_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        calificacion: { type: Number, required: true, min: 1, max: 5 },
        comentario: { type: String },
        fecha: { type: Date, default: Date.now }
    }
)

export const Review = mongoose.model('Review', reviewModel)