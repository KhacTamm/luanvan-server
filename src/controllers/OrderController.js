import { OrderModel } from '../models/OrderModel.js'
import expressAsyncHandler from 'express-async-handler'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

export const createOrder = expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'cart is emty' })
    } else {
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

        const createOrder = await order.save()
        res.status(201).send({ message: 'new order created', order: createOrder })
    }
})

export const clientCancelOrder = expressAsyncHandler(async (req, res) => {
    const updateOrder = await OrderModel.findById({ _id: req.params.id })

    if (updateOrder) {
        updateOrder.cancelOrder = true
        await updateOrder.save()
    }
    res.send(updateOrder)
})

export const updateOrder = expressAsyncHandler(async (req, res) => {
    try {
        let updateOrder = await OrderModel.findById({ _id: req.params.id })

        if (updateOrder) {
            let items = []
            updateOrder.orderItems.map((x) => {
                let item = {}
                item.name = x.name
                item.quantity = parseInt(x.qty)
                item.price = x.salePrice

                items.push(item)
            })

            const orderGhn = {
                payment_type_id: updateOrder.paymentMethod === 'payLater' ? 2 : 1,

                to_name: updateOrder.name,
                to_phone: updateOrder.shippingAddress.phone,
                to_address: `${updateOrder.shippingAddress.province}, ${updateOrder.shippingAddress.district}, ${updateOrder.shippingAddress.ward}, ${updateOrder.shippingAddress.detail}`,
                to_ward_code: updateOrder.to_ward_code,
                to_district_id: updateOrder.to_district_id,

                weight: 200,
                length: 1,
                width: 19,
                height: 10,

                service_id: 0,
                service_type_id: 2,

                note: '',
                required_note: 'KHONGCHOXEMHANG',

                cod_amount:
                    updateOrder.paymentMethod === 'payLater' ? updateOrder.totalPriceFeeShip - updateOrder.feeShip : 0,
                items,
            }
            updateOrder.order_code = req.params.id
            try {
                const { data } = await axios.post(
                    'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
                    orderGhn,
                    {
                        headers: {
                            Shop_id: process.env.SHOP_ID,
                            Token: process.env.TOKEN_GHN,
                        },
                    },
                )

                const order_code = data.data.order_code

                updateOrder.order_code = order_code

                await updateOrder.save()
                res.send(updateOrder)
            } catch (error) {
                console.log(error)
            }
        } else {
            res.send({ msg: 'product not found' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const CalculateFee = expressAsyncHandler(async (req, res) => {
    try {
        const address = req.body

        const formatAddressGhn = {
            from_district_id: 1572,
            from_ward_code: '550113',

            service_id: 0,
            service_type_id: 2,

            to_district_id: Number(address.district),
            to_ward_code: address.ward,

            weight: 200,
            length: 1,
            width: 19,
            height: 10,

            insurance_value: 10000,
            cod_failed_amount: 2000,
            coupon: null,
        }
        try {
            const { data } = await axios.post(
                'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
                formatAddressGhn,
                {
                    headers: {
                        Shop_id: process.env.SHOP_ID,
                        Token: process.env.TOKEN_GHN,
                    },
                },
            )
            if (data) {
                const resultFeeShip = data.data.total
                res.send(resultFeeShip + '')
            }
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const PrintOrderGhn = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.findById({ _id: req.params.id })
        if (Order) {
            let token

            try {
                const { data } = await axios.get('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/a5/gen-token', {
                    headers: {
                        Token: process.env.TOKEN_GHN,
                    },
                    params: {
                        order_codes: Order.order_code,
                    },
                })

                token = data.data.token
                Order.token = token
                await Order.save()

                const result = await axios.get(
                    `https://dev-online-gateway.ghn.vn/a5/public-api/printA5?token=${token}`,
                    {
                        headers: {
                            Token: process.env.TOKEN_GHN,
                        },
                    },
                )

                res.send(result.config.url)
            } catch (error) {
                // console.log(error)
            }
        } else {
            res.send({ message: 'order not found' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrder = expressAsyncHandler(async (req, res) => {
    try {
        //await OrderModel.remove()
        const Order = await OrderModel.find({}).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderPaypal = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ paymentMethod: 'payOnline' }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderPendding = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            // $or: [{ status: 'pendding' }, { paymentMethod: 'payOnline' }],
            $or: [{ status: 'pendding' }],
        }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderShipping = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ status: 'shipping' }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderDelivery = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ status: 'delivery' }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderPaid = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ status: 'paid' }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderCancel = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ status: 'cancel' }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const DeleteOrder = expressAsyncHandler(async (req, res) => {
    try {
        const status = 'cancel'
        const Order = await OrderModel.findById({ _id: req.params.id })
        if (Order) {
            Order.status = status
            await Order.save()
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const ShippingProduct = expressAsyncHandler(async (req, res) => {
    try {
        const status = 'shipping'
        const Order = await OrderModel.findById({ _id: req.params.id })
        if (Order) {
            Order.status = status
            await Order.save()
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const PaidProduct = expressAsyncHandler(async (req, res) => {
    try {
        const status = 'paid'
        const Order = await OrderModel.findByIdAndUpdate({ _id: req.params.id }, { status: status })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

// --------------------    user

export const GetOrderByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({ user: req.params.id }).sort({
            createdAt: -1,
        })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderPaypalByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            paymentMethod: 'payOnline',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderPenddingByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            status: 'pendding',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderShippingByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            status: 'shipping',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderDeliveryByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            status: 'delivery',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderPaidByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            status: 'paid',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetOrderCancelByUser = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            user: req.params.id,
            status: 'cancel',
        }).sort({ createdAt: -1 })
        if (Order) {
            res.send(Order)
        } else {
            res.status(401).send({ message: 'no order by user' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})

export const GetAllOrderInAMonth = expressAsyncHandler(async (req, res) => {
    try {
        const Order = await OrderModel.find({
            createdAt: {
                $gte: new Date(2021, 7, 11),
                $lt: new Date(2021, 7, 16),
            },
        })

        if (Order) {
            res.send(Order)
        } else {
            res.status(400).send({ message: 'no product in a month' })
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error', error: error.message })
    }
})
