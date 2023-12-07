import express from 'express'
import {
    SearchType,
    UpdateTypeVisible,
    createNewTypeProduct,
    deleteTypeProduct,
    findTypeById,
    getAllTypeProduct,
    paginationTyPeProduct,
    updateTypeProduct,
} from '../controllers/CategoryController.js'

import { upload } from '../untils/until.js'

const CategoryRouter = express.Router()

CategoryRouter.post('/create', upload.single('image'), createNewTypeProduct)

CategoryRouter.put(
    '/update/visible/:id',
    // isAuth,
    // isAdmin,
    UpdateTypeVisible,
)

CategoryRouter.put(
    '/update',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    updateTypeProduct,
)
CategoryRouter.delete('/delete/:id', deleteTypeProduct)
CategoryRouter.get('/detail/:id', findTypeById)
CategoryRouter.get(`/pagination/:page`, paginationTyPeProduct)
CategoryRouter.get('/search', SearchType)
CategoryRouter.get('/', getAllTypeProduct)

export default CategoryRouter
