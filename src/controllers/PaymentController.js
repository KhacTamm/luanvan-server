import { OrderModel } from '../models/OrderModel.js'
import expressAsyncHandler from 'express-async-handler'
import dotenv from 'dotenv'

import moment from 'moment'
import QueryString from 'qs'
import * as crypto from 'crypto'

// let tmnCode = process.env.VNP_TMN_CODE
// let secretKey = process.env.VNP_HASH_SECRET
// let vnpUrl = process.env.VNP_URL
// let returnUrl = process.env.VNP_RETURN_URL
export const createPayment = expressAsyncHandler(async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'

    const order = new OrderModel({
        order_code: '',
        to_ward_code: req.body.to_ward_code,
        to_district_id: req.body.to_district_id,
        cancelOrder: false,

        orderItems: req.body.orderItems,
        shippingAddress: {
            province: req.body.shippingAddress.province,
            district: req.body.shippingAddress.district,
            ward: req.body.shippingAddress.ward,
            detail: req.body.shippingAddress.more,
            name: req.body.shippingAddress.name,
            phone: req.body.shippingAddress.phone,
        },
        paymentMethod: req.body.paymentMethod,
        paymentResult: req.body.paymentResult
            ? {
                  id: req.body.paymentResult.id,
                  status: req.body.paymentResult.status,
                  update_time: req.body.paymentResult.update_time,
                  email_address: req.body.paymentResult.payer.email_address,
              }
            : '',
        totalPriceFeeShip: req.body.totalPriceFeeShip,
        totalPrice: req.body.totalPrice,
        feeShip: req.body.feeShip,
        userOrderIn4: req.body.user,
        voucher: req.body.voucher,

        status: req.body.status ? req.body.status : 'pendding',
        name: req.body.shippingAddress.name,
        user: req.body.user,
    })

    order.save()

    let date = new Date()
    let createDate = moment(date).format('YYYYMMDDHHmmss')

    let ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

    let tmnCode = process.env.VNP_TMN_CODE
    let secretKey = process.env.VNP_HASH_SECRET
    let vnpUrl = process.env.VNP_URL
    let returnUrl = process.env.VNP_RETURN_URL

    let orderId = moment(date).format('DDHHmmss')
    let amount = req.body.amount
    let bankCode = req.body.bankCode

    let locale = 'VN'
    let currCode = 'VND'
    let vnp_Params = {}
    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = tmnCode
    vnp_Params['vnp_Locale'] = locale
    vnp_Params['vnp_CurrCode'] = currCode
    vnp_Params['vnp_TxnRef'] = orderId
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId
    vnp_Params['vnp_OrderType'] = 'other'
    vnp_Params['vnp_Amount'] = req.body.totalPriceFeeShip * 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl
    vnp_Params['vnp_IpAddr'] = ipAddr
    vnp_Params['vnp_CreateDate'] = createDate
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = 'NCB'
    }

    vnp_Params = sortObject(vnp_Params)

    let signData = QueryString.stringify(vnp_Params, { encode: false })
    let hmac = crypto.createHmac('sha512', secretKey)

    console.log(hmac)

    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed
    vnpUrl += '?' + QueryString.stringify(vnp_Params, { encode: false })
    console.log(vnpUrl)

    res.status(200).json({ code: '00', data: vnpUrl })
})

export const returnPayment = expressAsyncHandler(async (req, res) => {
    let vnp_Params = req.query

    let secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    let tmnCode = process.env.VNP_TMN_CODE
    let secretKey = process.env.VNP_HASH_SECRET

    let signData = QueryString.stringify(vnp_Params, { encode: false })
    let hmac = crypto.createHmac('sha512', secretKey)
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.status(200).json({ code: vnp_Params.vnp_ResponseCode })
    } else {
        res.status(200).json({ code: '97' })
    }
})

export const inpPayment = async (req, res) => {
    let vnp_Params = req.query
    let secureHash = vnp_Params['vnp_SecureHash']

    let orderId = vnp_Params['vnp_TxnRef']
    let rspCode = vnp_Params['vnp_ResponseCode']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)
    let secretKey = process.env.VNP_HASH_SECRET
    let signData = QueryString.stringify(vnp_Params, { encode: false })
    let hmac = crypto.createHmac('sha512', secretKey)
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    let paymentStatus = '0' // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) {
        //kiểm tra checksum
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == '0') {
                    //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if (rspCode == '00') {
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    } else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    }
                } else {
                    res.status(200).json({
                        RspCode: '02',
                        Message: 'This order has been updated to the payment status',
                    })
                }
            } else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
            }
        } else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }
}

function sortObject(obj) {
    let sorted = {}
    let str = []
    let key
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key))
        }
    }
    str.sort()
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
}
