import express from 'express'
import { Cart } from '../models/cartModel.js'
import { cartCreate } from '../controllers/cartController.js'
import { authenticateToken } from '../middleware/auth.js'

export const cartRoutes = express.Router()

cartRoutes.get("/:userId",authenticateToken, async(req,res)=>{
    try {
        const user_id = req.params
        const cart = await Cart.findOne({ user_id: user_id })
            .populate('items.producto_id', 'nombre precio')
        if (!cart) {
            cart = await cartCreate({ user_id: user_id, items: [] })
            res.status(201).json(carrito)
        }
        res.status(200).json(cart)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

cartRoutes.get("/:userId/total",authenticateToken, async(req,res)=>{
    try {
        const {user_id} = req.params
        const cart = await Cart.findOne({user_id: user_id})
            .populate('items.producto_id','nombre precio')
        if(!cart){
            res.status(400).json({mesagge: `Carrito no encontrado`})
        }
        let total = 0
        const itemsSubtotal = cart.items.map(i=>{
            const subTotal = i.cantidad * i.producto_id.precio
            total += subTotal
            return {
                producto: i.producto_id.nombre,
                cantidad: i.cantidad,
                precioUnidad: i.producto_id.precio,
                subTotal
            }
        })
        res.status(200).json({user_id: user_id, items: itemsSubtotal, total})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

cartRoutes.put("/:userId",authenticateToken, async(req,res)=>{
    try {
        const {id} = req.params
        const {items: producto_id, cantidad} = req.body
        if(!producto_id || !cantidad || cantidad < 1){
            res.status(400).json({mesagge: `Faltan datos o estos son incorroctos`})
        }
        const cart = await Cart.findOne({user_id: user_id})
        if(!cart){
            res.status(400).json({mesagge: `Carrito no encontrado`})
        }
        const index = cart.items.findIndex(
            i => i.producto_id.toString() === producto_id
        )
        if(item > -1){
            cart.items[index].cantidad = cantidad
        } else {
            cart.items.push({items: producto_id, cantidad})
        }
        const cartUpdate = await cart.save()
        res.status(200).json(cartUpdate)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el put: ${error}`})
    }
})

cartRoutes.delete("/:userId/:prductId",authenticateToken, async(req,res)=>{
    try {
        const {user_id} = req.params
        const {producto_id} = req.params
        const cart = await Cart.findOne({user_id: user_id})
        if (!cart) {
            res.status(404).json({mesagge: `Carrito no encontrado` })
        }
        const index = cart.items.findIndex(
            i => i.producto_id.toString() === producto_id
        )
        if (index > -1) {
            cart.items.splice(index, 1);
            const cartUpdate = await cart.save()
            res.status(200).json(cartUpdate)
        } else {
            res.status(404).json({mesagge: `Producto no encontrado en el carrito` });
        }
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})

cartRoutes.delete("/:userId", authenticateToken, async(req,res)=>{
    try {
        const user_id = req.params
        const cart = await Cart.findOne({ user_id: user_id })
        if (!cart) {
            res.status(400).json({mesagge: `Carrito no encontrado` })
        }
        cart.items = []
        const cartVacio = await cart.save();
        res.status(200).json(cartVacio);
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})