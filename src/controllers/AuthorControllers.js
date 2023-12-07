import expressAsyncHandler from 'express-async-handler'
import cloudinary from 'cloudinary'
import { AuthorModel } from '../models/AuthorModel.js'
export const getAllAuthor = expressAsyncHandler(async (req, res) => {
    try {
        const authors = await AuthorModel.find({})

        if (authors) {
            res.send(authors)
        } else {
            res.status(404).send({ message: 'Không tìm thấy tác giả nào.' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách tác giả.' })
    }
})

export const createAuthor = expressAsyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'Chưa tải lên hình ảnh của tác giả.' })
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dev_setups',
        })

        if (!result || !result.secure_url || !result.public_id) {
            return res.status(500).send({ message: 'Lỗi khi tải lên hình ảnh tác giả.' })
        }

        const newAuthor = new AuthorModel({
            name: req.body.name || '',
            image: result.secure_url,
            cloudinary_id: result.public_id,
            biography: req.body.detail || '',
            visible: req.body.visible || true,
        })

        await newAuthor.save()
        res.send(newAuthor)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tạo tác giả.' })
    }
})

export const updateAuthor = expressAsyncHandler(async (req, res) => {
    try {
        if (!req.body._id) {
            return res.status(400).send({ message: 'Thiếu thông tin tác giả cần cập nhật.' })
        }

        const author = await AuthorModel.findById(req.body._id)

        if (!author) {
            return res.status(404).send({ message: 'Không tìm thấy tác giả để cập nhật.' })
        }

        if (req.file) {
            // Xóa hình ảnh cũ trên Cloudinary
            if (author.cloudinary_id) {
                await cloudinary.uploader.destroy(author.cloudinary_id)
            }

            // Tải lên hình ảnh mới và cập nhật thông tin tác giả
            const result = await cloudinary.uploader.upload(req.file.path)
            author.image = result.secure_url
            author.cloudinary_id = result.public_id
        }

        author.name = req.body.name || author.name
        author.visible = req.body.visible
        author.biography = req.body.detail || author.biography

        await author.save()
        res.send(author)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật tác giả.' })
    }
})

export const UpdateAuthorVisible = expressAsyncHandler(async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).send({ message: 'Thiếu ID của tác giả cần cập nhật.' })
        }

        const author = await AuthorModel.findById(req.params.id)

        if (!author) {
            return res.status(404).send({ message: 'Không tìm thấy tác giả để cập nhật.' })
        }

        author.visible = req.body.visible
        const updateAuthor = await author.save()

        if (updateAuthor) {
            return res.status(200).send({ message: 'Cập nhật tác giả thành công', data: updateAuthor })
        } else {
            return res.status(500).send({ message: 'Cập nhật tác giả thất bại' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật tác giả.' })
    }
})

export const findAuthorById = expressAsyncHandler(async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id)

        if (author) {
            res.json(author) // Trả về dữ liệu tìm thấy dưới dạng JSON
        } else {
            res.status(404).json({ message: 'Tác giả không được tìm thấy' })
        }
    } catch (error) {
        console.error(error) // Ghi log lỗi để gỡ rối
        res.status(500).json({ message: 'Lỗi server' })
    }
})

export const deleteAuthor = expressAsyncHandler(async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id)

        if (author) {
            // Xóa tài liệu trên Cloudinary trước khi xóa tác giả
            if (author.cloudinary_id) {
                await cloudinary.uploader.destroy(author.cloudinary_id)
            }

            await author.remove()
            res.json({ message: 'Tác giả đã bị xóa' })
        } else {
            res.status(404).json({ message: 'Tác giả không được tìm thấy' })
        }
    } catch (error) {
        console.error(error) // Ghi log lỗi để gỡ rối
        res.status(500).json({ message: 'Lỗi server' })
    }
})

export const SearchAuthor = expressAsyncHandler(async (req, res) => {
    try {
        const name = req.query.name

        if (!name) {
            return res.status(400).send({ message: 'Tên tác giả không được trống.' })
        }

        const author = await AuthorModel.find({ name: { $regex: name, $options: 'si' } })
        res.send(author)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm tác giả.' })
    }
})

export const paginationAuthor = expressAsyncHandler(async (req, res) => {
    try {
        var perPage = new Number(req.params.perPage) || 4

        var page = req.params.page || 1

        await AuthorModel.find({})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, authors) {
                AuthorModel.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    if (authors.length > 0) {
                        res.send({
                            authorLists: authors,
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
