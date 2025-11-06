import { verifyToken, requireAdmin } from "../services/auth.service"

export const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({message:'no existe token'})
    }
    verifyToken(token)
    next()
}

export const verifyRol = (req,res,next)=>{
    const rol = req.user.rol
    if(!rol){
        return res.status(401).json({mesagge: `El usuario no tiene asignado un rol`})
    }
    requireAdmin(rol)
    next()
}