import express from 'express'
import {
    getAllUser,
    registerUser,
    login,
    UpdateUser,
    findUserById,
    addAddress,
    updateAddress,
    setDefaultAddress,
    addUser,
    deleteUser,
    searchUser,
    deleteAddress,
} from '../controllers/UserController.js'
const UserRouter = express.Router()
import { isAuth, isAdmin } from '../untils/until.js'
import { upload } from '../untils/until.js'

UserRouter.put('/addaddress/:id', upload.single('image'), addAddress)
UserRouter.put('/updateaddress/:id/:address', upload.single('image'), updateAddress)
UserRouter.put('/setdefaultaddress/:id/:address', upload.single('image'), setDefaultAddress)
UserRouter.put('/update/:id', upload.single('image'), UpdateUser)

UserRouter.post('/register', upload.single('image'), registerUser)
UserRouter.post('/create', upload.single('image'), addUser)
UserRouter.post('/login', login)

UserRouter.delete('/delete/address/:id/:address', deleteAddress)
UserRouter.delete('/delete/:id', deleteUser)

UserRouter.get('/search', searchUser)
UserRouter.get('/detail/:id', findUserById)
UserRouter.get('/', getAllUser)

export default UserRouter
