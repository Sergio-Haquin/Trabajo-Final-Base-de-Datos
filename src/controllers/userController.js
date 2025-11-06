import { User } from '../models/userModel.js'
import { hashPassword, validatePass } from '../services/password.service.js'
import { generateToken } from '../services/auth.service.js'

export const userCreate = async(nombre,email,direccion,telefono,rol,contrasena) => {
    const pass = hashPassword(contrasena)
    const user = new User(
        {
            nombre,
            email,
            direccion,
            telefono,
            rol,
            contrasena:pass
        }
    )
    const newUser = await user.save()
    const token = generateToken(newUser)
    return { user: newUser, token }
}

export const login = async(email,contrasena) => {
    const user = await User.findOne({email})
    const passCorrect = await validatePass(contrasena, user.contrasena)
    if(!passCorrect){
        throw new Error("Contraseña invalida")
    }
    const token = generateToken(user)
    return { user, token }
}