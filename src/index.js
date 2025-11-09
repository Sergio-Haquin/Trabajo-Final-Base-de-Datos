import express from 'express'
import mongoose from 'mongoose'
import { userRoutes } from './routes/userRoutes.js'
import { categoryRoutes } from './routes/categoryRoutes.js'
import { productRoutes } from './routes/productRoutes.js'
import { reviewRoutes } from './routes/reviewRoutes.js'
import { cartRoutes } from './routes/cartRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URL,{dbName:process.env.DB_NAME}).then(()=>
    console.log("Conexion Correcta")
).catch((e)=>{
    console.error("Error al conectarse con mongo", e)
})


app.use("/api/users",userRoutes)
app.use("/api/categorias",categoryRoutes)
app.use("/api/productos",productRoutes)
app.use("/api/resenas",reviewRoutes)
app.use("/api/carrito",cartRoutes)
app.use("/api/ordenes",orderRoutes)


app.listen(process.env.PORT,()=>{
    console.log("corriendo en el puerto: ", process.env.PORT)
})