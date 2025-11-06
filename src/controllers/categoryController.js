import {Category} from '../models/categoryModel.js'

export const categoryCreate = async(nombre,descripcion,productos) => {
    const category = new Category(
        {
            nombre,
            descripcion,
            productos
        }
    )
    const newCategory = await category.save()
    return newCategory
}