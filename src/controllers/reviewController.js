import { Review } from '../models/reviewModel.js'

export const reviewCreate = async(user_id,product_id,calificacion,comentario,fecha) => {
    const review = new Review(
        {
            user_id,
            product_id,
            calificacion,
            comentario,
            fecha
        }
    )
    const newReview = await review.save()
    return newReview
}