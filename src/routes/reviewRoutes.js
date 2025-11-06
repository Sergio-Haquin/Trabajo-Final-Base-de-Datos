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

reviewRoutes.post("/api/resenaas",authenticateToken, async(req,res)=>{
    try {
        const {user_id,producto_id,calificacion,comentario} = req.body
        if(!user_id || !producto_id || !calificacion || !comentario){
            res.status(400).json({mesagge: `Faltan argumentos`})
        }
        const order = await Order.find({
            user_id: user_id,
            "productos.producto_id": producto_id
        });

        if (!order || order.length === 0) {
            res.status(400).json({mesagge: `No puedes reseñar un producto que no has comprado`});
        }
        const newReview = await reviewCreate(user_id,producto_id,calificacion,comentario)
        await Product.findByIdAndUpdate(producto_id, {$push:{reseñas: newReview._id}})
        res.status(201).json(newReview)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el post: ${error}`})
    }
})

reviewRoutes.put("api/resenas/:id",authenticateToken, async(req,res)=>{
    try {
        const {id} = req.params
        const datos = req.body
        const reviewUpdate = await Review.findByIdAndUpdate(id,datos,{
            new: true,
            runValidators: true
        })
        if(!reviewUpdate){
            res.status(400).json({mesagge: `Reseña no encontrada`})
        }
        res.status(200).json(reviewUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

reviewRoutes.delete("/api/resenas/:id",authenticateToken, async(req,res)=>{
    try {
        const {id} = req.params
        const reviewDelete = await Review.findByIdAndDelete(id)
        if(!reviewDelete){
            res.status(400).json({mesagge: `Reseña no encontrada`})
        }
        res.status(200).json({mesagge: `Reseña eliminada correctamente`})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})