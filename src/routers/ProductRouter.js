import express from 'express'
import {
    getAllProduct,
    filterProductByType,
    findProductById,
    AddProduct,
    DeleteProduct,
    DeleteAllProduct,
    CommentProduct,
    UpdateProduct,
    HandlePaymentProduct,
    SearchProduct,
    SearchType,
    SearchPublisherProduct,
    paginationProduct,
    RateProduct,
    RepCommentProduct,
    PinCommentProduct,
    filterProductByRandomField,
    SearchAuthor,
    paginationProductbyAuthor,
    AlsoLikeProduct,
    UpdateVisible,
    getAllRateProduct,
    deleteRateProduct,
    // FilterProduct,
} from '../controllers/ProductController.js'
import { isAuth, isAdmin } from '../untils/until.js'
import { upload } from '../untils/until.js'

const ProductRouter = express.Router()

ProductRouter.post('/filter/random', filterProductByRandomField)
ProductRouter.post('/rate/:id', RateProduct)
ProductRouter.post('/comment/:id', CommentProduct)
ProductRouter.post('/pin/comment/:id', PinCommentProduct)
ProductRouter.post('/rep/comment/:id', RepCommentProduct)
ProductRouter.post(
    '/create',
    //  isAuth,
    // isAdmin,
    upload.single('image'),
    AddProduct,
)

ProductRouter.put(
    '/update/visible/:id',
    // isAuth,
    // isAdmin,
    UpdateVisible,
)
ProductRouter.put(
    '/update',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    UpdateProduct,
)
ProductRouter.put(
    '/handlepayment',
    // isAuth,
    // isAdmin,
    // upload.single("image"),
    HandlePaymentProduct,
)

ProductRouter.delete(
    '/delete/all',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    DeleteAllProduct,
)
ProductRouter.delete(
    '/delete/:id',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    DeleteProduct,
)

// ProductRouter.get('/filter/:startPrice/endPrice', FilterProduct)

ProductRouter.delete('/rate/delete/:id/:idComment', deleteRateProduct)
ProductRouter.get('/rate', getAllRateProduct)
ProductRouter.get('/detail/:id', findProductById)
ProductRouter.get('/alsolikeproduct/:name', AlsoLikeProduct)
ProductRouter.get(`/pagination/:page/:perPage`, paginationProduct)
ProductRouter.get(`/pagination/author/:author/:page`, paginationProductbyAuthor)
ProductRouter.get('/search/product', SearchProduct)
ProductRouter.get('/search/:page/type', SearchType)
ProductRouter.get('/search/publisher', SearchPublisherProduct)
ProductRouter.get('/search/author', SearchAuthor)
ProductRouter.get('/', getAllProduct)

export default ProductRouter
