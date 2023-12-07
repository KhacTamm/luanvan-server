import expressAsyncHandler from 'express-async-handler'
import cloudinary from 'cloudinary'

import { PromotionModel } from '../models/PromotionModel.js'

export const createPromotion = expressAsyncHandler(async (req, res) => {
    try {
        const newVoucher = new PromotionModel({
            name: req.body.name,
            limmit: req.body.limmit,
            qty: req.body.qty,
            dayStart: req.body.dayStart,
            dayEnd: req.body.dayEnd,
            condition: req.body.condition,
            used: 0,
            state: 'comeSoon',
            visible: true,
        })
        await newVoucher.save()
        res.status(201).send(newVoucher)
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình tạo loại sản phẩm.' })
    }
})

export const updatePromotion = expressAsyncHandler(async (req, res) => {
    try {
        const voucher = await PromotionModel.findById(req.body._id)

        if (voucher) {
            voucher.name = req.body.name || voucher.name
            voucher.limmit = req.body.limmit || voucher.limmit
            voucher.qty = req.body.qty || voucher.qty
            voucher.dayStart = req.body.dayStart || voucher.dayStart
            voucher.dayEnd = req.body.dayEnd || voucher.dayEnd
            voucher.condition = req.body.condition || voucher.condition
            voucher.visible = req.body.visible || voucher.visible
            await voucher.save()
            res.send(voucher)
        } else {
            return res.status(404).send({ message: 'Không tìm thấy loại sản phẩm cần cập nhật.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật loại sản phẩm.' })
    }
})

export const UpdateVisiblePromotion = expressAsyncHandler(async (req, res) => {
    try {
        const voucher = await PromotionModel.findById(req.params.id)

        if (voucher) {
            voucher.visible = req.body.visible
            const updateVoucher = await voucher.save()
            if (updateVoucher) {
                return res
                    .status(200)
                    .send({ message: 'Trạng thái hiển thị sản phẩm đã được cập nhật', data: updateVoucher })
            }
        }

        res.status(404).send({ message: 'Không tìm thấy sản phẩm cần cập nhật' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Lỗi trong quá trình cập nhật trạng thái hiển thị sản phẩm' })
    }
})

export const getAllPromotion = expressAsyncHandler(async (req, res) => {
    try {
        const promotions = await PromotionModel.find({})

        if (promotions) {
            res.send(promotions)
        } else {
            res.status(404).send({ message: 'Không tìm thấy voucher nào.' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Lỗi trong quá trình lấy danh sách voucher.' })
    }
})

export const findPromotionById = expressAsyncHandler(async (req, res) => {
    try {
        const voucher = await PromotionModel.findById(req.params.id)

        if (voucher) {
            return res.send(voucher)
        } else {
            return res.status(404).send({ message: 'Promotion not found' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'An error occurred while finding the promotion' })
    }
})

export const deletePromotion = expressAsyncHandler(async (req, res) => {
    try {
        const voucher = await PromotionModel.findById(req.params.id)

        if (voucher) {
            await voucher.remove()
            return res.send({ message: 'Voucher deleted successfully' })
        } else {
            return res.status(404).send({ message: 'Voucher not found' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'An error occurred while deleting type product' })
    }
})

export const HandlePaymentPromotion = expressAsyncHandler(async (req, res) => {
    try {
        const voucher = await PromotionModel.findById(req.body.id)
        if (voucher) {
            voucher.used = voucher.used + 1
            voucher.save()
            return res.send('update success')
        } else {
            return res.send('update fail')
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})
