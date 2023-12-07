import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const Cart = new Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    idProduct: String,
    name: String,
    salePrice: String,
    price: String,
    amount: Number,
    qty: Number,

    image: String
},
{
    timestamps: true,
  },
)

export const CartModel = mongoose.model('Cart', Cart)
