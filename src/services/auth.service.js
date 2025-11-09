import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET || "default-secret"
export const generateToken = (user)=>{
    return jwt.sign({user},secret,{expiresIn:'1h'} )
}

export const verifyToken = (token,res)=>{
    return jwt.verify(token,secret,(err,decode)=>{
        if(err){
            return res.status(401).json({mesagge:'error al verificar el token'})
        }
        return decode
    })
}

export const requireAdmin = (rol)=>{
    if(rol !== 'admin'){
        throw new Error("Se requiere rol de administrador")
    }
    return true
}

//ho