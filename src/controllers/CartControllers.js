import expressAsyncHandler from 'express-async-handler'

import { ProductModel } from '../models/ProductModel.js'
import { CartModel } from '../models/CartModel.js'

export const getCart = expressAsyncHandler(async (req, res) => {
    const idUser = await CartModel.find({ idUser: req.params.id }).sort({
        createdAt: -1,
    })
    if (idUser) {
        res.send(idUser)
    } else {
        res.status(401).send({ message: 'no order by user' })
    }
})

//Hàm thêm sản phẩm
export const addToCart = expressAsyncHandler(async (req, res) => {
    const idUser = req.body.idUser
    const idProduct = req.body.idProduct || req.body._id
    const qty = req.body.count || 1

    if (!idUser || !idProduct || qty <= 0) {
        return res.status(400).send({ message: 'Dữ liệu không hợp lệ' })
    }

    try {
        const product = await ProductModel.findOne({ _id: idProduct })

        if (!product) {
            return res.status(404).send({ message: 'Sản phẩm không tồn tại' })
        }

        const carts = await CartModel.findOne({ idUser: idUser, idProduct: idProduct })

        if (!carts) {
            const dataInsert = {
                idUser: idUser,
                idProduct: idProduct,
                name: product.name,
                salePrice: product.salePrice,
                price: product.price,
                amount: product.amount,
                qty: qty,
                image: product.image,
            }

            CartModel.insertMany(dataInsert)

            res.send('Thành công!')
        } else {
            carts.qty += parseInt(qty)

            carts.save()

            res.send('Thành công!')
        }
    } catch (error) {
        // Bắt lỗi và gửi thông báo lỗi về cho client
        res.status(500).send({ message: 'Lỗi xử lý yêu cầu' })
    }
})

//Hàm giam sản phẩm
export const decreaseToCart = expressAsyncHandler(async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.id)

        if (!cart) {
            res.status(404).json({ message: 'Không tìm thấy giỏ hàng' })
            return
        }

        // Kiểm tra nếu qty hiện tại là 0 thì không giảm nữa
        if (cart.qty > 0) {
            cart.qty -= 1
            await cart.save()
        }

        res.json({ message: 'Thành công!' })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' })
    }
})

//Hàm Xóa Sản Phẩm
export const deleteToCart = expressAsyncHandler(async (req, res) => {
    const cartId = req.params.id // Lấy id của sản phẩm trong giỏ hàng
    const userId = req.params.user // Lấy id của người dùng

    try {
        const deletedCart = await CartModel.findById(cartId)

        if (!deletedCart) {
            return res.status(404).send({ message: 'Sản phẩm trong giỏ hàng không tồn tại' })
        }

        await deletedCart.remove()

        const userCarts = await CartModel.find({ idUser: userId }).sort({
            createdAt: -1,
        })

        if (userCarts) {
            res.send(userCarts)
        } else {
            res.status(404).send({ message: 'Không tìm thấy đơn hàng của người dùng' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Lỗi xử lý yêu cầu' })
    }
})

//Hàm Xóa tất cả Sản Phẩm
export const deleteAllToCart = expressAsyncHandler(async (req, res) => {
    const userId = req.params.id // Lấy id của người dùng

    try {
        const userCarts = await CartModel.find({ idUser: userId })

        if (userCarts.length === 0) {
            return res.status(404).send({ message: 'Giỏ hàng của người dùng rỗng' })
        }

        await CartModel.deleteMany({ idUser: userId })

        res.send({ message: 'Xóa giỏ hàng thành công' })
    } catch (error) {
        res.status(500).send({ message: 'Lỗi xử lý yêu cầu' })
    }
})

//Hàm Sửa Sản Phẩm
export const updateToCart = expressAsyncHandler(async (req, res) => {
    //Lấy idUSer của user cần sửa
    const idUser = req.query.idUser

    //Lấy idProduct của user cần sửa
    const idProduct = req.query.idProduct

    //Lấy count của user cần sửa
    const count = req.query.count

    //Tìm đúng cái sản phẩm mà User cần sửa
    var cart = await CartModel.findOne({ idUser: idUser, idProduct: idProduct })

    cart.count = count

    cart.save()

    res.send('Update Thanh Cong')
})
