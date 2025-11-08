import express from 'express'
import { Order } from '../models/orderModel.js'
import { orderCreate } from '../controllers/orderController.js'
import { authenticateToken, verifyRol } from '../middleware/auth.js'
import { Estado } from '../enums/estado.js'
import { Product } from '../models/productModel.js'

export const orderRoutes = express.Router()

orderRoutes.get("/", async(req,res)=>{
    try {
        const orders = await Order.find()
            .populate('user_id','nombre email')
            .populate('productos.producto_id','nombre precio')
        if(orders.length === 0){
            res.status(400).json({mesagge: `No hay pedidos registrados`})
        }
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

orederRoutes.get("/stats",authenticateToken,verifyRol, async(req,res)=>{
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$estado',
                    totalPedidos: { $sum: 1 }
                }
            },
            {
                $sort: { totalPedidos: -1 }
            },
            {
                $proyect: {
                    estado: '$_id',
                    _id: 0,
                    totalPedidos: 1
                }
            }
        ])
        res.status(200).json(stats)
    } catch (error) {
        req.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

orderRoutes.get("/user/:userId",authenticateToken, async(req,res)=>{
    try {
        const {userId} = req.params
        const ordersUser = await Order.find({user_id: userId})
            .populate('user_id','nombre email')
            .populate('productos.producto_id','nombre precio')
            .sort({fecha: -1})
        if(ordersUser.length === 0){
            res.status(400).json({mesagge: `No se encontraron pedidos del usuario`})
        }
        res.status(200).json(ordersUser)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

orderRoutes.post("/",authenticateToken, async(req,res)=>{
    try {
        const {user_id,estado,productos,metodoDePago} = req.body
        if(!user_id || !estado || !productos?.length || !metodoDePago){
            res.status(400).json({error: `Faltan datos del pedido`})
        }
        let total = 0
        for (let p of productos){
            const product = await Product.findById(p.producto_id)
            if(!product){
                res.status(400).json({error: `Producto no encontrado`})
            }
            const subtotal = product.precio * p.cantidad
            total += subtotal
        }
        const newOrder = await orderCreate(user_id,estado,productos,metodoDePago,total)
        res.status(201).json(newOrder)
    } catch (erro) {
        res.status(500).json({mesagge: `Error en el post: ${error}`})
    }
})

orderRoutes.put("/:id",authenticateToken, async(req,res)=>{
    try {
        const {id} = req.params
        const {estado,productos,metodoDePago} = req.body
        const orderExist = await Order.findById(id)
        if (!orderExist) {
            res.status(400).json({ error: "Pedido no encontrado" })
        }
        let total = orderExist.total
        let productosActualizados = orderExist.productos
        if (productos && productos.length > 0) {
            total = 0
            productosActualizados = []
            for (const p of productos) {
                const producto = await Product.findById(p.producto_id)
                if (!producto) {
                    res.status(400).json({ error: `Producto no encontrado` });
                }
                const subtotal = producto.precio * p.cantidad
                total += subtotal
                productosActualizados.push({
                    producto_id: producto._id,
                    cantidad: item.cantidad,
                    subtotal,
                })
            }
        }
        orderExist.productos = productosActualizados
        orderExist.total = total
        if (metodoPago) orederExist.metodoDePago = metodoDePago
        if (estado) orderExist.estado = estado
        const orderUpdate = await orderExist.save()
        const orderFinal = await Order.findById(orderUpdate._id)
            .populate("user_id", "nombre email")
            .populate("productos.producto_id", "nombre precio")
        res.status(200).json(orderFinal)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

orderRoutes.patch("/:id/status",authenticateToken,verifyRol, async(req,res)=>{
    try {
        const {id} = req.params
        const {nuevoestado} = req.body
        if(!nuevoestado){
            res.status(400).json({mesagge: `Debe ingreasar el nuevo estado`})
        }
        const estadosValidos = Object.values(Estado);
        if (!estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({message: `Estado inválido. Los estados permitidos son ${estadosValidos.join(', ')}` })
        }
        const orderUpdate = await Order.findByIdAndUpdate(
            id,
            {estado: nuevoestado},
            {new: true, runValidators: true}
        )
        if(!orderUpdate){
            req.status(400).json({mesagge: `Orden no encontrada`})
        }
        req.status(200).json(orderUpdate)
    } catch (error) {
        req.status(500).json({mesagge: `Error en el patch: ${error}`})
    }
})

orderRoutes.delete("/:id",authenticateToken, async(req,res)=>{
    try {
        const {id} = req.params
        const orderDelete = await Order.findByIdAndDelete(id)
        if(!orderDelete){
            res.status(400).json({error: `Pedido no encontrado`})
        }
        res.status(200).json({mesagge: `Pedido eliminado con exito`})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})