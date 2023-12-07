import { ProductModel } from '../models/ProductModel.js'
import expressAsyncHandler from 'express-async-handler'
import { PinComment } from '../untils/until.js'
import cloudinary from 'cloudinary'
import { spawn } from 'child_process'

export const getAllProduct = expressAsyncHandler(async (req, res) => {
    try {
        const products = await ProductModel.find({})
        res.send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách sản phẩm.' })
    }
})

export const AddProduct = expressAsyncHandler(async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dev_setups',
        })

        const product = new ProductModel({
            name: req.body.name,
            price: req.body.price || '',
            salePrice: req.body.salePrice || '',
            amount: req.body.amount || '',
            type: req.body.type || '',
            publisher: req.body.publisher || '',
            author: req.body.author || '',
            detail: req.body.detail || '',
            image: result.secure_url,
            cloudinary_id: result.public_id,
            rating: 0,
            size: req.body.size || '',
            page: req.body.page || '',
            datePublisher: req.body.datePublisher || '',
            coverType: req.body.coverType || '',
            translator: req.body.translator || '',
            visible: req.body.visible || false,
        })

        const newProduct = await product.save()

        if (newProduct) {
            res.status(201).send({ message: 'Sản phẩm mới đã được tạo', data: newProduct })
        } else {
            res.status(500).send({ message: 'Lỗi trong quá trình tạo sản phẩm.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tạo sản phẩm.' })
    }
})

export const findProductById = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)

        if (product) {
            res.send(product)
        } else {
            res.status(404).send({ message: 'Sản phẩm không được tìm thấy' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm sản phẩm.' })
    }
})

export const filterProductByType = expressAsyncHandler(async (req, res) => {
    try {
        const type = req.params.type
        const filterProductByType = await ProductModel.find({ type }).limit(5)
        res.send(filterProductByType)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lọc sản phẩm theo loại.' })
    }
})

export const filterProductByRandomField = expressAsyncHandler(async (req, res) => {
    try {
        const filterConditions = req.body
        const products = await ProductModel.find(filterConditions)
        if (products && products.length > 0) {
            res.send(products)
        } else {
            res.status(404).send({ message: 'Không tìm thấy sản phẩm nào thỏa mãn điều kiện.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lọc sản phẩm.' })
    }
})

// --------------------------------------------------------- Search ------------------------------------------------------------
export const SearchProduct = expressAsyncHandler(async (req, res) => {
    try {
        const name = req.query.name
        const products = await ProductModel.find({ name: { $regex: name, $options: 'si' } })

        res.send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm sản phẩm' })
    }
})

export const SearchType = expressAsyncHandler(async (req, res) => {
    try {
        const type = req.query.type
        const products = await ProductModel.find({ type: { $regex: type, $options: 'si' } })

        res.send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm sản phẩm theo loại' })
    }
})

export const SearchPublisherProduct = expressAsyncHandler(async (req, res) => {
    try {
        const publisher = req.query.publisher
        const products = await ProductModel.find({ publisher: { $regex: publisher, $options: 'si' } })

        res.send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm sản phẩm theo nhà xuất bản' })
    }
})

export const SearchAuthor = expressAsyncHandler(async (req, res) => {
    try {
        const author = req.query.author
        const products = await ProductModel.find({ author: author })
        res.send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm sản phẩm của tác giả' })
    }
})

// ---------------------------------------------------------------------------------------------------------------------

export const UpdateProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.body._id)

        if (product) {
            await cloudinary.uploader.destroy(product.cloudinary_id)

            let result
            if (req.file) {
                result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'dev_setups',
                })
            }

            product.name = req.body.name || product.name
            product.amount = req.body.amount || product.amount
            product.price = req.body.price || product.price
            product.salePrice = req.body.salePrice || product.salePrice
            product.type = req.body.type || product.type
            product.publisher = req.body.publisher || product.publisher
            product.author = req.body.author || product.author

            product.image = result?.secure_url || product.image
            product.cloudinary_id = result?.public_id || product.cloudinary_id

            product.rating = req.body.rating || product.rating
            product.datePublisher = req.body.datePublisher || product.datePublisher
            product.visible = req.body.visible || product.visible

            product.size = req.body.size
            product.page = req.body.page
            product.coverType = req.body.coverType
            product.translator = req.body.translator
            product.detail = req.body.detail

            const updateProduct = await product.save()
            if (updateProduct) {
                return res.status(200).send({ message: 'Sản phẩm đã được cập nhật', data: updateProduct })
            }
        }
        res.status(404).send({ message: 'Không tìm thấy sản phẩm cần cập nhật' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật sản phẩm.' })
    }
})

export const UpdateVisible = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)

        if (product) {
            product.visible = req.body.visible
            const updateProduct = await product.save()
            if (updateProduct) {
                return res
                    .status(200)
                    .send({ message: 'Trạng thái hiển thị sản phẩm đã được cập nhật', data: updateProduct })
            }
        }

        res.status(404).send({ message: 'Không tìm thấy sản phẩm cần cập nhật' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật trạng thái hiển thị sản phẩm' })
    }
})

export const DeleteProduct = expressAsyncHandler(async (req, res) => {
    try {
        const deleteProduct = await ProductModel.findById(req.params.id)

        if (deleteProduct) {
            // Xóa hình ảnh trên Cloudinary trước khi xóa sản phẩm
            await cloudinary.uploader.destroy(deleteProduct.cloudinary_id)

            await deleteProduct.remove()
            res.status(200).send({ message: 'Sản phẩm đã bị xóa' })
        } else {
            res.status(404).send({ message: 'Không tìm thấy sản phẩm để xóa' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa sản phẩm' })
    }
})

export const DeleteAllProduct = expressAsyncHandler(async (req, res) => {
    try {
        const deleteProduct = await ProductModel.deleteMany({})

        if (deleteProduct.deletedCount > 0) {
            res.status(200).send({ message: 'Tất cả sản phẩm đã bị xóa' })
        } else {
            res.status(404).send({ message: 'Không tìm thấy sản phẩm để xóa' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa sản phẩm' })
    }
})

export const HandlePaymentProduct = expressAsyncHandler(async (req, res) => {
    try {
        const data = req.body
        let success = true

        for (let i = 0; i < data.length; i++) {
            let id = data[i].idProduct
            const product = await ProductModel.findById(id)
            if (product) {
                product.amount = product.amount - data[i].qty
                product.rating = product.rating + data[i].qty
                const updateProduct = await product.save()
                if (!updateProduct) {
                    success = false
                }
            }
        }

        if (success) {
            return res.send('update success')
        } else {
            return res.send('update fail')
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

export const paginationProduct = expressAsyncHandler(async (req, res) => {
    try {
        var perPage = new Number(req.params.perPage) || 4

        var page = req.params.page || 1

        await ProductModel.find({})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, products) {
                ProductModel.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    if (products.length > 0) {
                        res.send({
                            products: products,
                            current: page,
                            pages: Math.ceil(count / perPage),
                        })
                    }
                })
            })
    } catch (error) {
        console.log(error)
    }
})

export const paginationProductbyAuthor = expressAsyncHandler(async (req, res) => {
    try {
        var perPage = 4
        var author = req.params.author || ''
        var page = req.params.page || 1

        ProductModel.find({ author: author })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, products) {
                ProductModel.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    res.send({
                        products: products,
                        current: page,
                        pages: Math.ceil(count / perPage),
                    })
                })
            })
    } catch (error) {
        console.log(error)
    }
})

export const RateProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (product) {
            const existsUser = product.reviews.find((x) => x.name === req.body.name)
            if (existsUser) {
                res.send({ message: 'ban da danh gia san pham nay' })
            } else {
                product.reviews.push(req.body)
                const updateProduct = await product.save()
                res.send(updateProduct)
            }
        } else {
            res.status(400).send({ message: 'product not found' })
        }
    } catch (error) {
        console.log(error)
    }
})

export const CommentProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (product) {
            product.comments.push(req.body)
            const updateCommentProduct = await product.save()
            res.send(updateCommentProduct)
        } else {
            res.status(400).send({ message: 'product not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình thêm bình luận sản phẩm' })
    }
})

export const RepCommentProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (product) {
            const indexComment = product.comments.findIndex((item) => item._id == req.body.idComment)
            product.comments[indexComment].replies.push(req.body)

            await product.save()
            res.send(product)
        } else {
            res.status(400).send({ message: 'product not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình thêm bình luận sản phẩm' })
    }
})

export const PinCommentProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (product) {
            const indexComment = product.comments.findIndex((item) => item._id == req.body.idComment)
            product.comments[indexComment] = req.body
            PinComment(product.comments, indexComment, 0)

            await product.save()
            res.send(product)
        } else {
            res.status(400).send({ message: 'product not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình thêm bình luận sản phẩm' })
    }
})

export const AlsoLikeProduct = expressAsyncHandler(async (req, res) => {
    try {
        const user_input = req.query.name
        const process = await spawn('python', ['./process.py', user_input], {
            encoding: 'utf-8', // Đảm bảo gửi và nhận dữ liệu dưới dạng UTF-8
        })

        process.stdout.on('data', async function (data) {
            const ProductSimilar = await data.toString()
            // console.log(ProductSimilar)
            data[0]
            const formatString = await ProductSimilar.replace(/[!@#$%^&*(),.?":{}|[\]\\]/g, '')
            const delimiter = /['']/
            const converArray = await formatString.split(delimiter)
            const ListP = await converArray.filter((item) => item !== ' ').slice(1, -1)
            // console.log('----------------' + ListP.length)
            if (ListP.length > 0) {
                const list = []
                for (const item of ListP) {
                    const product = await ProductModel.find({ _id: item })
                    list.push(...product)
                }
                // console.log(list)
                res.send(list)
            } else {
                res.send('Không tìm thấy sản phẩm')
            }
        })

        process.on('error', function (error) {
            console.error('Lỗi khi chạy tiến trình Python:', error)
            res.status(500).send('Lỗi khi chạy tiến trình Python.')
        })
    } catch (error) {
        console.log(error)
    }
})

export const getAllRateProduct = expressAsyncHandler(async (req, res) => {
    try {
        // Lấy tất cả các sản phẩm từ cơ sở dữ liệu
        const products = await ProductModel.find({})

        // Tạo một mảng chứa tất cả các comment từ tất cả các sản phẩm với ID và tên sản phẩm
        let allComments = []
        products.forEach((product) => {
            if (product.comments && Array.isArray(product.comments)) {
                product.comments.forEach((comment) => {
                    const commentInfo = {
                        productId: product._id, // Lấy ID của sản phẩm
                        productImg: product.image, // Lấy ID của sản phẩm
                        productName: product.name, // Lấy tên của sản phẩm
                        commentData: comment, // Thêm thông tin của comment vào mảng
                    }
                    allComments.push(commentInfo)
                })
            }
        })

        // Sắp xếp tất cả các comment theo thời gian tạo (createdAt)
        allComments.sort((comment1, comment2) => {
            const time1 = new Date(comment1.commentData.createdAt).getTime()
            const time2 = new Date(comment2.commentData.createdAt).getTime()
            return time2 - time1 // Sắp xếp giảm dần theo thời gian tạo
        })

        // Gửi danh sách các comment đã được sắp xếp cho client
        res.send(allComments)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách sản phẩm.' })
    }
})

export const deleteRateProduct = expressAsyncHandler(async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (product) {
            const indexComment = product.comments.findIndex((item) => item._id == req.params.idComment)
            product.comments.splice(indexComment, 1)

            await product.save()

            res.status(200).send({ message: 'Đánh giá đã bị xóa' })
        } else {
            res.status(400).send({ message: 'Đánh giá not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa đánh giá' })
    }
})
