import express from 'express'
import { Product } from '../models/productModel.js'
import { productCreate } from '../controllers/productController.js'
import { Category } from '../models/categoryModel.js'
import { validateToken, requireAdmin } from '../services/auth.service.js'

export const productRoutes = express.Router()

productRoutes.get("/", async(req,res)=>{
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

productRoutes.get("/filtro", async(req,res)=>{
    try {
        const { min, max, marca } = req.query
        const filtro ={}
        if(marca){
            filtro.marca = {}
            filtro.marca.$eq = String(marca)
        }
        if(min || max){
            filtro.precio = {}
            if(min) filtro.precio.$gte = Number(min)
            if(max) filtro.precio.$lte = Number(max)
        }
        const products = await Product.find(filtro)
        if(products.length === 0){
            res.status(204).json([])
        }
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

productRoutes.get("/top", async(req,res)=>{
    try {
        const productTopResenas = await Product.aggregate([
            {
                $lookup: {
                    from: "review",
                    localField: "_id",
                    foreignField: "producto_id",
                    as: "reseñas"
                }
            },
            {
                $addFields: {
                    cantidadResenas: { $size: "$reseñas" }
                }
            },
            { $sort: { cantidadResenas: -1 } },
            { $limit: 5 },
            {
                $project: {
                    nombre: 1,
                    descripcion: 1,
                    precio: 1,
                    cantidadResenas: 1
                }
            }
        ])
        if (!productTopResenas.length) {
            return res.status(404).json({ message: "No hay productos con reseñas" });
        }
        res.status(200).json(productTopResenas)
    } catch (error) {
        res.status(500).json({messagge: `Error en el get: ${error}`})
    }
})

productRoutes.post("/",validateToken,requireAdmin, async(req,res)=>{
    try {
        const {nombre,marca,descripcion,precio,categoria_id,stock} = req.body
        if(!nombre || !marca || !descripcion || !precio || !categoria_id || !stock){
            return res.status(400).json({mesagge: `Falta alguno de los datos`})
        }
        const productExist = await Product.findOne({nombre})
        if(productExist){
            return res.status(400).json({mesagge: `El producto ya esta registrado`})
        }
        const newProduct = await productCreate(nombre,marca,descripcion,precio,categoria_id,stock)
        const categoria = await Category.findById(categoria_id)
        categoria.productos.push(newProduct._id)
        await categoria.save()
        res.status(201).json(newProduct)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el post: ${error}`})
    }
})

productRoutes.put("/:id",validateToken,requireAdmin, async(req,res)=>{
    try {
        const { id } = req.params
        const datos = req.body
        const productUpdate = await Product.findByIdAndUpdate(id, datos, {
            new: true,
            runValidators: true
        })
        if (!productUpdate){
            res.status(400).json({ error: "Producto no encontrado" })
        }
        res.status(200).json(productUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

productRoutes.patch("/:id/stock",validateToken,requireAdmin, async(req,res)=>{
    try {
        const { id } = req.params
        const { stock } = req.body
        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: `Stock inválido`})
        }
        const productUpdate = await Product.findByIdAndUpdate(
            id,
            { stock },
            { new: true, runValidators: true }
        )
        if (!productUpdate) {
            return res.status(400).json({ message: `Producto no encontrado` })
        }
        res.status(200).json(productUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

productRoutes.delete("/:id",validateToken,requireAdmin, async(req,res)=>{
    try {
        const {id} = req.params
        const productDelete = await Product.findByIdAndDelete(id)
        if(!productDelete){
            res.status(400).json({mesagge: `Producto no encontrado`})
        }
        res.status(200).json({mesagge: `Producto eliminado correctamente`})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})