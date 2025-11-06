import express from 'express'
import { Product } from '../models/productModel'
import { productCreate } from '../controllers/productController.js'
import { verifyToken, requireAdmin } from '../services/auth.service.js'

export const productRoutes = express.Router()

const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({message:'no existe token'})
    }
    verifyToken(token)
    next()
}

const verifyRol = (req,res,next)=>{
    const rol = req.user.rol
    if(!rol){
        return res.status(401).json({mesagge: `El usuario no tiene asignado un rol`})
    }
    requireAdmin(rol)
    next()
}

productRoutes.get("/api/productos", async(req,res)=>{
    try{
        const products = await Product.find({})
            .populate('categoria_id', 'nombre')
            if(products.length === 0){
                res.status(400).json([])
            }
        const respFormat = products.map(p => ({
            _id: p._id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            categoria: p.categoria_id.nombre,
            stock: p.stock
        }))
        res.status(200).json(respFormat)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

productRoutes.get("/api/productos/filtro", async(req,res)=>{
    try {
        const { min, max } = req.params
        const filtro ={}
        if(min || max){
            filtro.precio = {}
            if(min) filtro.precio.$gte = Number(min)
            if(max) filtro.precio.$lte = Number(max)
        }
        const products = await Product.find(filtro)
        if(prosucts.length === 0){
            res.status(204).json([])
        }
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})