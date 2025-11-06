import bcrypt from "bcrypt"

export const hashPassword = async(contrasena)=>{
    return await bcrypt.hash(contrasena,10)
}

export const validatePass = async (pass,hash)=>{
    return await bcrypt.compare(pass, hash)
}