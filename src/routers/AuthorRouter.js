import express from 'express'
import { upload } from '../untils/until.js'
import {
    SearchAuthor,
    UpdateAuthorVisible,
    createAuthor,
    deleteAuthor,
    findAuthorById,
    getAllAuthor,
    paginationAuthor,
    updateAuthor,
} from '../controllers/AuthorControllers.js'

const AuthorRouter = express.Router()

AuthorRouter.get('/detail/:id', findAuthorById)
AuthorRouter.get(`/pagination/:page/:perPage`, paginationAuthor)

AuthorRouter.post('/create', upload.single('image'), createAuthor)

AuthorRouter.put(
    '/update/visible/:id',
    // isAuth,
    // isAdmin,
    UpdateAuthorVisible,
)

AuthorRouter.put(
    '/update',
    // isAuth,
    // isAdmin,
    upload.single('image'),
    updateAuthor,
)

AuthorRouter.delete('/delete/:id', deleteAuthor)
AuthorRouter.get('/search', SearchAuthor)
AuthorRouter.get('/', getAllAuthor)

export default AuthorRouter
