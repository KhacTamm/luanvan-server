import express from 'express'
import {
    getAllPublisher,
    createPublisher,
    deletePublisher,
    paginationPublisher,
    updateNewPublisher,
    findPublisherById,
    UpdatePublisherVisible,
    SearchPublisher,
} from '../controllers/PublisherController.js'
import { upload } from '../untils/until.js'

const PublisherRouter = express.Router()

PublisherRouter.get('/search', SearchPublisher)
PublisherRouter.get(`/pagination/:page`, paginationPublisher)
PublisherRouter.get('/detail/:id', findPublisherById)

PublisherRouter.put(
    '/update',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    updateNewPublisher,
)

PublisherRouter.put(
    '/update/visible/:id',
    // isAuth,
    // isAdmin,
    UpdatePublisherVisible,
)

PublisherRouter.post('/create', upload.single('image'), createPublisher)
PublisherRouter.delete('/delete/:id', deletePublisher)

PublisherRouter.get('/', getAllPublisher)

export default PublisherRouter
