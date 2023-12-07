import mongoose from 'mongoose'

const Schema = mongoose.Schema

const addressUser = new Schema({
    isDefault: { type: Boolean },
    userNameDelivery: { type: String },
    userNamePhone: { type: Number },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    detail: { type: String },
    to_district_id: { type: String },
    to_ward_code: { type: String },
})

const User = new Schema(
    {
        name: { type: String },
        image: { type: String },
        email: { type: String, unique: true },
        password: { type: String },

        address: [addressUser],

        phone: { type: Number },
        isAdmin: { type: Boolean },

        cloudinary_id: { type: String },
    },
    {
        timestamps: true,
    },
)

export const UserModel = mongoose.model('User', User)
