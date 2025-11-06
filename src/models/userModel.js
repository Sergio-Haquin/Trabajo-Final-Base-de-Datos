import mongoose from 'mongoose'
import Rol from '../enums/rol.js'

const userModel = mongoose.Schema(
    {
        nombre: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        direccion: {
            calle: { type: String, required: true },
            numero: { type: Number, required: true },
            ciudad: { type: String, required: true },
            provincia: { type: String, required: true }
        },
        telefono: { type: Number },
        rol: {
            type: String, 
            enum: Rol, 
            default: 'cliente' 
        },
        contraseña: { type: String, required: true }
    }
)

export const User = mongoose.model('User', userModel)