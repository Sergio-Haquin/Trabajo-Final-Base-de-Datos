import express from 'express'
import { Review } from '../models/reviewModel'
import { reviewCreate } from '../controllers/reviewController.js'
import { authenticateToken, verifyRol } from '../middleware/auth.js'

const reviewRoutes = express.Router()

reviewRoutes.get("/api/resenas", async(req,res)=>{
    try {
        const reviews = await Review.find()
        if(reviews.length === 0){
            res.status(204).json([])
        }
        res.status(200).json(reviews)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

reviewRoutes.get("/api/resenas/product/:productId", async(req,res)=>{
    try {
        const {producto_id} = req.params
        const resenasProduct = await Review.find({producto_id: producto_id})
            .populate('user_id','nombre')
            .sort({fecha: -1})
        if(resenasProduct.length === 0){
            res.status(204).json([])
        }
        res.status(200).json(resenasProduct)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

reviewRoutes.get("/api/resenas/top", async(req,res)=>{
    try {
        const promCal = Review.aggregate([
            {
                $group: {
                    _id: "$producto_id",
                    promedioCalificacion: { $avg: "$calificacion" },
                    totalResenas: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "Product",
                    localField: "_id",
                    foreignField: "producto_id",
                    as: "producto"
                }
            },
            { $unwind: "$producto" },
            {
                $project: {
                    _id: 0,
                    productoId: "$producto._id",
                    nombreProducto: "$producto.nombre",
                    promedioCalificacion: 1,
                    totalResenas: 1
                }
            }
        ])
        res.status(200).json(promCal)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})