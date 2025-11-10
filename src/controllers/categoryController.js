import {Category} from '../models/categoryModel.js'

export const categoryCreate = async(nombre,descripcion) => {
    const category = new Category(
        {
            nombre,
            descripcion
        }
    )
    const newCategory = await category.save()
    return newCategory
}