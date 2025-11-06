import express from 'express'
import { Category } from '../models/categoryModel'
import { categoryCreate } from '../controllers/categoryController.js'
import { verifyRol, authenticateToken } from '../middleware/auth.js'

export const categoryRoutes = express.Router()

categoryRoutes.get("/api/categorias/stats", async(req,res)=>{
    try {
        const productForCategory = await Category.aggregate([
            {   
                $project: {
                    _id: 0,
                    nombre: "$nombre",
                    descripcion: "$descripcion",
                    "Cantidad de Productos": { $size: "$productos" }
                }
            }
        ])
        return res.status(200).json(productForCategory)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

categoryRoutes.post("/api/categoria",authenticateToken,verifyRol, async(req,res)=>{
    try {
        const {nombre,descripcion} = req.body
        if(!nombre || !descripcion){
            res.status(400).json({mesagge: `Faltan elementos`})
        }
        const categoryExist = await Category.findOne({nombre})
        if(categoryExist){
            res.status(400).json({mesagge: `La categoria ingresada ya existe`})
        }
        const newCategory = categoryCreate(nombre,descripcion)
        res.status(201).json(newCategory)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el post: ${error}`})
    }
})

categoryRoutes.put("/api/categoria/:id",authenticateToken,verifyRol, async(req,res)=>{
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const categoryUpdate = await Category.findByIdAndUpdate(
            id,
            { nombre, descripcion },
            { new: true }
        )
        if (!categoryUpdate)
            return res.status(404).json({ message: "Categoría no encontrada" })
        res.status(200).json(categoryUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error.mesagge}`})
    }
})

categoryRoutes.delete("/api/categoria/:id",authenticateToken,verifyRol, async(req,res)=>{
    try {
        const { id } = req.params;
        const categoryDelete = await Category.findByIdAndDelete(id);
        if (!categoryDelete)
            return res.status(404).json({ message: "Categoría no encontrada" })
        await Producto.deleteMany({ categoria_id: id })
        res.status(200).json({ message: `Categoria eliminada correctament` });
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error.mesagge}`})
    }
})