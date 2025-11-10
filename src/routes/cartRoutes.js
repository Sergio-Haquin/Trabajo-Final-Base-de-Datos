import express from 'express'
import mongoose from 'mongoose'
import { Cart } from '../models/cartModel.js'
import { cartCreate } from '../controllers/cartController.js'
import { validateToken } from '../services/auth.service.js'

export const cartRoutes = express.Router()

cartRoutes.get("/:userId",validateToken, async(req,res)=>{
    try {
        const { userId } = req.params
        const cart = await Cart.findOne({ user_id: userId })
            .populate('items.producto_id', 'nombre precio')
        if (!cart) {
            const newCart = await cartCreate(userId, [])
            res.status(201).json(newCart)
        }
        res.status(200).json(cart)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

cartRoutes.get("/:userId/total",validateToken, async(req,res)=>{
    try {
        const {userId} = req.params
        const cart = await Cart.findOne({user_id: userId})
            .populate('items.producto_id','nombre precio')
        if(!cart){
            res.status(400).json({mesagge: `Carrito no encontrado`})
        }
        let total = 0
        const itemsSubtotal = cart.items
            .filter(i => i.producto_id)
            .map(i=>{
            const subTotal = i.cantidad * i.producto_id.precio
            total += subTotal
            return {
                producto: i.producto_id.nombre,
                cantidad: i.cantidad,
                precioUnidad: i.producto_id.precio,
                subTotal
            }
        })
        res.status(200).json({user_id: userId, items: itemsSubtotal, total})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

cartRoutes.put("/:userId",validateToken, async(req,res)=>{
    try {
        const {userId} = req.params
        const {producto_id, cantidad} = req.body
        if(!producto_id || !cantidad || cantidad < 1){
            res.status(400).json({mesagge: `Faltan datos o estos son incorrectos`})
        }
        const cart = await Cart.findOne({user_id: userId})
        if(!cart){
            res.status(400).json({mesagge: `Carrito no encontrado`})
        }
        const index = cart.items.findIndex(
            i => i.producto_id.toString() === producto_id
        )
        if(index > -1){
            cart.items[index].cantidad = cantidad
        } else {
            cart.items.push({producto_id, cantidad})
        }
        const cartUpdate = await cart.save()
        res.status(200).json(cartUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

cartRoutes.delete("/:userId/:productId",validateToken, async(req,res)=>{
    try {
        const {userId, productId} = req.params
        const objectIdToDelete = new mongoose.Types.ObjectId(productId)
        const cartUpdate = await Cart.findOneAndUpdate(
            { user_id: userId },
            { $pull: { 
                items: {
                    producto_id: objectIdToDelete
                } 
            }},
            { new: true }
        )
        if (!cartUpdate) {
        return res.status(404).json({ message: "Carrito no encontrado para este usuario." });
        }
        return res.status(200).json({ 
            message: 'Producto eliminado del carrito correctamente.',
            cart: cartUpdate 
        })
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})

cartRoutes.delete("/:userId", validateToken, async(req,res)=>{
    try {
        const { userId } = req.params
        const objectIdUser = new mongoose.Types.ObjectId(userId)
        const cartVacio = await Cart.findOneAndUpdate(
            { user_id: objectIdUser },
            { $set: { items: [] } }, 
            { new: true } 
        )
        if (!cartVacio) {
            return res.status(404).json({ message: "Carrito no encontrado para este usuario." });
        }
        return res.status(200).json({ 
            message: 'Carrito vaciado correctamente.', 
            cart: cartVacio 
        })
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})