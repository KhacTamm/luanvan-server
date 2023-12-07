import expressAsyncHandler from 'express-async-handler'
import cloudinary from 'cloudinary'
import { PublisherModel } from '../models/PublisherModel.js'

export const getAllPublisher = expressAsyncHandler(async (req, res) => {
    try {
        const allPublisher = await PublisherModel.find({})
        res.send(allPublisher)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách nhà xuất bản sản phẩm.' })
    }
})

export const findPublisherById = expressAsyncHandler(async (req, res) => {
    try {
        const publisher = await PublisherModel.findById(req.params.id)

        if (publisher) {
            res.send(publisher)
        } else {
            res.send({ message: 'publisher not found' })
        }
    } catch (error) {
        console.log(error)
    }
})

export const createPublisher = expressAsyncHandler(async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dev_setups',
        })
        const newPublisher = new PublisherModel({
            name: req.body.name,
            img: result.secure_url,
            visible: req.body.visible || true,
            cloudinary_id: result.public_id,
        })

        const publisher = await newPublisher.save()
        res.status(201).send(publisher)
    } catch (error) {
        console.log(error)
    }
})

export const updateNewPublisher = expressAsyncHandler(async (req, res) => {
    try {
        const publisher = await PublisherModel.findById(req.body._id)

        await cloudinary.uploader.destroy(publisher.cloudinary_id)

        let result
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path)
        }

        if (publisher) {
            publisher.name = req.body.name
            publisher.visible = req.body.visible
            publisher.img = result?.secure_url || publisher.img
            publisher.cloudinary_id = result?.public_id || publisher.cloudinary_id
        }

        await publisher.save()
        res.send(publisher)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật nhà xuất bản sản phẩm.' })
    }
})

export const UpdatePublisherVisible = expressAsyncHandler(async (req, res) => {
    try {
        const publisher = await PublisherModel.findById(req.params.id)

        if (publisher) {
            publisher.visible = req.body.visible
            const updatePublisher = await publisher.save()
            if (updatePublisher) {
                res.status(201).send({ message: 'Cập nhật thành công', data: updatePublisher })
            } else {
                res.status(400).send({ message: 'Lỗi khi cập nhật nhà xuất bản' })
            }
        } else {
            res.status(404).send({ message: 'Không tìm thấy nhà xuất bản' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật nhà xuất bản' })
    }
})

export const deletePublisher = expressAsyncHandler(async (req, res) => {
    try {
        const publisher = await PublisherModel.findById(req.params.id)

        if (publisher) {
            // Xóa hình ảnh trên Cloudinary trước
            await cloudinary.uploader.destroy(publisher.cloudinary_id)

            // Sau đó xóa bản ghi nhà xuất bản sản phẩm
            await publisher.remove()
            res.status(200).send({ message: 'Đã xóa nhà xuất bản sản phẩm thành công.' })
        } else {
            res.status(404).send({ message: 'Không tìm thấy nhà xuất bản sản phẩm.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình xóa nhà xuất bản sản phẩm.' })
    }
})

export const SearchPublisher = expressAsyncHandler(async (req, res) => {
    try {
        const name = req.query.name
        console.log(name)
        const publisher = await PublisherModel.find({ name: { $regex: name, $options: 'i' } })

        res.status(200).send(publisher)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm nhà xuất bản sản phẩm.' })
    }
})

export const paginationPublisher = expressAsyncHandler(async (req, res) => {
    try {
        var perPage = 4
        var page = req.params.page || 1

        PublisherModel.find({})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, publisher) {
                PublisherModel.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    res.send({
                        ListBrannd: publisher,
                        current: page,
                        pages: Math.ceil(count / perPage),
                    })
                })
            })
    } catch (error) {
        console.log(error)
    }
})
