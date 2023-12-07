import expressAsyncHandler from 'express-async-handler'
import { CategoryModel } from '../models/CategoryModel.js'

export const getAllTypeProduct = expressAsyncHandler(async (req, res) => {
    try {
        const allType = await CategoryModel.find({})
        if (allType) {
            res.status(200).send(allType)
        } else {
            res.status(404).send({ message: 'Không tìm thấy danh sách loại sản phẩm.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách loại sản phẩm.' })
    }
})

export const createNewTypeProduct = expressAsyncHandler(async (req, res) => {
    try {
        const { name, visible } = req.body

        if (!name) {
            return res.status(400).send({ message: 'Tên loại sản phẩm không được bỏ trống.' })
        }

        const newType = new CategoryModel({
            name: name,
            visible: visible || true,
        })

        await newType.save()
        res.status(201).send(newType)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tạo loại sản phẩm.' })
    }
})

export const updateTypeProduct = expressAsyncHandler(async (req, res) => {
    try {
        const { _id, name, visible } = req.body

        if (!_id) {
            return res.status(400).send({ message: 'Thiếu thông tin loại sản phẩm cần cập nhật.' })
        }

        const type = await CategoryModel.findById(_id)

        if (type) {
            type.name = name || type.name
            type.visible = visible || type.visible
            await type.save()
            res.send(type)
        } else {
            return res.status(404).send({ message: 'Không tìm thấy loại sản phẩm cần cập nhật.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật loại sản phẩm.' })
    }
})

export const UpdateTypeVisible = expressAsyncHandler(async (req, res) => {
    try {
        const type = await CategoryModel.findById(req.params.id)

        if (type) {
            type.visible = req.body.visible
            const updatedType = await type.save()

            if (updatedType) {
                return res.status(201).send({ message: 'Type visibility updated successfully', data: updatedType })
            }
        }

        return res.status(404).send({ message: 'Type not found' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'An error occurred while updating type visibility' })
    }
})

export const deleteTypeProduct = expressAsyncHandler(async (req, res) => {
    try {
        const typeProduct = await CategoryModel.findById(req.params.id)

        if (typeProduct) {
            await typeProduct.remove()
            return res.send({ message: 'Type product deleted successfully' })
        } else {
            return res.status(404).send({ message: 'Type product not found' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'An error occurred while deleting type product' })
    }
})

export const findTypeById = expressAsyncHandler(async (req, res) => {
    try {
        const type = await CategoryModel.findById(req.params.id)

        if (type) {
            return res.send(type)
        } else {
            return res.status(404).send({ message: 'Type not found' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'An error occurred while finding the type' })
    }
})

export const SearchType = expressAsyncHandler(async (req, res) => {
    try {
        const name = req.query.name
        const type = await CategoryModel.find({ name: { $regex: name, $options: 'i' } })

        res.send(type)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tìm kiếm loại sản phẩm' })
    }
})

export const paginationTyPeProduct = expressAsyncHandler(async (req, res) => {
    try {
        var perPage = 6
        var page = req.params.page || 1
        CategoryModel.find({})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, products) {
                CategoryModel.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    res.send({
                        typeProducts: products,
                        current: page,
                        pages: Math.ceil(count / perPage),
                    })
                })
            })
    } catch (error) {
        console.log(error)
    }
})
