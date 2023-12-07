import express from 'express'
import {
    getCart,
    addToCart,
    deleteToCart,
    deleteAllToCart,
    updateToCart,
    decreaseToCart,
} from '../controllers/CartControllers.js'

const CartRouter = express.Router()

CartRouter.put('/decreaseqty/:id', decreaseToCart)
CartRouter.delete('/delete/:id/:user', deleteToCart)
CartRouter.delete('/delete/:id', deleteAllToCart)
CartRouter.post('/addCart/:id', addToCart)
CartRouter.get('/:id', getCart)

export default CartRouter
