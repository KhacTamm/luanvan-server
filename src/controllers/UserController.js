import { UserModel } from '../models/UserModel.js'
import expressAsyncHandler from 'express-async-handler'
import { generateToken } from '../untils/until.js'
import { PinComment } from '../untils/until.js'
import cloudinary from 'cloudinary'

export const getAllUser = async (req, res) => {
    try {
        const users = await UserModel.find({})
        res.send(users.reverse())
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách người dùng.' })
    }
}

export const findUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)

        if (user) {
            res.send(user)
        } else {
            res.status(404).send({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Error finding user' })
    }
}

export const registerUser = async (req, res) => {
    try {
        const user = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone || '',
            isAdmin: false,
            image: '',
            cloudinary_id: '',
        })

        const newUser = await user.save()
        if (newUser) {
            const token = generateToken(newUser)
            res.status(201).send({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                image: newUser.image,
                password: newUser.password,
                address: newUser.address,
                phone: newUser.phone,
                token,
            })
        } else {
            res.status(400).send({ message: 'Create user not successful' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

export const addUser = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dev_setups',
        })

        const user = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            phone: req.body.phone || '',
            isAdmin: false,
            image: result.secure_url || '',
            cloudinary_id: result.public_id || '',
        })

        const newUser = await user.save()
        if (newUser) {
            res.status(201).send({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                image: newUser.image,
                password: newUser.password,
                address: newUser.address,
                phone: newUser.phone,
            })
        } else {
            res.status(400).send({ message: 'Create user not successful' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({ email, password })

        if (user) {
            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                password: user.password,
                address: user.address,
                phone: user.phone,
                isAdmin: user.isAdmin,
                token: generateToken(user),
            })
        } else {
            res.status(401).send({ message: 'Email hoặc mật khẩu không chính xác, vui lòng nhập lại' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình đăng nhập' })
    }
}

export const UpdateUser = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id })

        if (!user) {
            return res.status(404).send({ message: 'Người dùng không tồn tại' })
        }

        let result
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'dev_setups',
            })
            if (user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id)
            }
        }

        user.name = req.body.name
        user.phone = req.body.phone
        user.image = result?.secure_url || user.image
        user.cloudinary_id = result?.public_id || user.cloudinary_id

        if (req.body.password !== undefined) {
            user.password = req.body.password
        }

        const updateUser = await user.save()

        if (updateUser) {
            return res.status(201).send(updateUser)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật thông tin người dùng' })
    }
}

export const addAddress = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id })

        if (!user) {
            return res.status(404).send({ message: 'Người dùng không tồn tại' })
        }

        const isDefault = JSON.parse(req.body.isDefault)

        if (isDefault) {
            user.address.forEach((item) => {
                item.isDefault = 'false'
            })
        }
        user.address.push(req.body)
        const addAddressUser = await user.save()
        res.send(addAddressUser)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình thêm địa chỉ' })
    }
}

export const updateAddress = expressAsyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id })

        if (!user) {
            return res.status(404).send({ message: 'Người dùng không tồn tại' })
        }

        const isDefault = JSON.parse(req.body.isDefault)

        if (isDefault) {
            user.address.forEach((item) => {
                item.isDefault = 'false'
            })
            await user.save()
        }

        let updated = false
        user.address.forEach((address) => {
            if (address._id.toString() === req.params.address) {
                Object.assign(address, req.body)
                updated = true
            }
        })

        if (updated) {
            await user.save()
            res.send(user)
        } else {
            res.status(404).send({ message: 'Địa chỉ không tồn tại' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật địa chỉ' })
    }
})

export const setDefaultAddress = expressAsyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id })

        if (!user) {
            return res.status(404).send({ message: 'Người dùng không tồn tại' })
        }

        const addressId = req.params.address

        user.address.forEach((item) => {
            item.isDefault = item._id.toString() === addressId ? 'true' : 'false'
        })

        await user.save()
        res.send(user)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình đặt địa chỉ mặc định' })
    }
})

export const deleteAddress = expressAsyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id })

        if (user) {
            const updatedAddress = user.address.filter((item) => {
                return JSON.stringify(item._id) !== JSON.stringify(req.params.address)
            })

            user.address = updatedAddress
            await user.save()
            res.send(user)
        } else {
            res.status(400).send({ message: 'Người dùng không tồn tại' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa địa chỉ' })
    }
})

export const deleteUser = expressAsyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findById({ _id: req.params.id })

        if (!user) {
            return res.status(404).send({ message: 'Người dùng không tồn tại' })
        }

        if (user.cloudinary_id) {
            await cloudinary.uploader.destroy(user.cloudinary_id)
        }

        await user.remove()
        res.send({ message: 'Người dùng đã bị xóa' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa người dùng' })
    }
})

export const searchUser = expressAsyncHandler(async (req, res) => {
    try {
        const name = req.query.name
        const users = await UserModel.find({ name: { $regex: name, $options: 'si' } })

        if (users.length > 0) {
            res.send(users)
        } else {
            res.send({ message: 'Không tìm thấy khách hàng' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm khách hàng' })
    }
})
