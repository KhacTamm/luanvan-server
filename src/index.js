import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db/db.js'

import ProductRouter from './routers/ProductRouter.js'
import UserRouter from './routers/UserRouter.js'
import CartRouter from './routers/CartRouter.js'
import OrderRouter from './routers/OrderRouter.js'
import CategoryRouter from './routers/CategoryRouter.js'
import PublisherRouter from './routers/PublisherRouter.js'

import { createServer } from 'http'

import cloudinary from './config/cloudinary/cloudinary.js'
import PaymentRouter from './routers/PaymentRouter.js'
import AuthorRouter from './routers/AuthorRouter.js'
import PromotionRouter from './routers/PromotionRouter.js'

dotenv.config()
process.env.TOKEN_SECRET

const app = express()
const PORT = process.env.PORT || 4000
const server = createServer(app)

// ConnectSocket(server)
connectDB()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/products', ProductRouter)
app.use('/user', UserRouter)
app.use('/cart', CartRouter)
app.use('/order', OrderRouter)
app.use('/payment', PaymentRouter)
app.use('/publisher', PublisherRouter)
app.use('/category', CategoryRouter)
app.use('/author', AuthorRouter)

app.use('/promotion', PromotionRouter)

app.get('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})

app.post('/api/upload', async (req, res) => {
    try {
        const fileStr = req.body.data
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'dev_setups',
        })
        res.json({ msg: 'yaya' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

server.listen(PORT, () => console.log(`server running on port ${PORT}`))
