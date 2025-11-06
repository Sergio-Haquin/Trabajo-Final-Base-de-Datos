import express from "express"
import { User}  from "../models/user.js"
import { userCreate, login } from "../controladores/userControler.js"
import { authenticateToken, verifyRol } from "../middleware/auth.js"

export const userRoutes = express.Router()

userRoutes.get("/api/users",authenticateToken,verifyRol,async(req,res)=>{
    try {
        const users = await User.find()
        if(users.length === 0){
            res.status(204).json([])
        }
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({mesagge: `Error en el get: ${error}`})
    }
})

userRoutes.get("api/users/:id", async(req,res)=>{
    try {
        const id = req.params
        const user = await User.findById(id)
        if(!user){
            res.status(400).json({mesagge: `El usuario no fue encontrado`})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: `Error en el get: ${error}`})
    }
})

userRoutes.post("/api/users", async(req, res)=>{
    try {
        const {nombre,email,direccion,telefono,rol,contraseña} = req.body
        if(!nombre || !email || !direccion || !telefono || !rol || !contraseña){
            res.status(400).json({mesagge:`Alguno de los parametros esta vacio`})
        }
        const userExist = await User.findOne({email})
        if(userExist){
            res.status(400).json({mesagge:`El email ya esta registrado`})
        }
        const newUser = await userCreate(nombre,email,direccion,telefono,rol,contraseña)
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({mesagge:`Error en el post de users: ${error}`})
    }
})

userRoutes.post("/api/users/login", async(req,res)=>{
    try{
        const {email,contraseña} = req.body
        if(!email || !contraseña){
            res.status(400).json({mesagge:`Algunos de los parametros esta vacio`})
        }
        const newUser = await login(email,contraseña)
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({mesagge:`Error en el login: ${error}`})
    }
})

userRoutes.delete("/api/users/:id", async(req,res)=>{
    try {
        const id = req.params
        const userDelete = await User.findByIdAndDelete(id)
        if(!userDelete){
            res.status(400).json({mesagge: `No se encontro el usuario`})
        }
        res.status(200).json({mesagge: `Usuario eliminado correctamente`})
    } catch (error) {
        res.status(500).json({mesagge: `Error en el delete: ${error}`})
    }
})