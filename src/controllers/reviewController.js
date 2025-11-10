import { Review } from '../models/reviewModel.js'

export const reviewCreate = async(user_id,producto_id,calificacion,comentario) => {
    const review = new Review(
        {
            user_id,
            producto_id,
            calificacion,
            comentario
        }
    )
    const newReview = await review.save()
    return newReview
}