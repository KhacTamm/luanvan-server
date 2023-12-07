import express from 'express'
import { upload } from '../untils/until.js'
import {
    HandlePaymentPromotion,
    UpdateVisiblePromotion,
    createPromotion,
    deletePromotion,
    findPromotionById,
    getAllPromotion,
    updatePromotion,
} from '../controllers/PromotionController.js'

const PromotionRouter = express.Router()

PromotionRouter.put(
    '/update',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    updatePromotion,
)

PromotionRouter.put(
    '/update/visible/:id',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    UpdateVisiblePromotion,
)

PromotionRouter.put(
    '/handlepayment',
    // isAuth,
    // isAdmin,
    // upload.single("image"),
    HandlePaymentPromotion,
)

PromotionRouter.post('/create', upload.single('image'), createPromotion)
PromotionRouter.delete('/delete/:id', deletePromotion)
PromotionRouter.get('/detail/:id', findPromotionById)
PromotionRouter.get('/', getAllPromotion)

export default PromotionRouter
