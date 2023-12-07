import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Promotion = new Schema(
    {
        name: { type: String, require: true },
        qty: { type: Number, require: true },
        limmit: { type: Number, require: true },
        used: { type: Number, require: true },
        dayStart: { type: Date },
        dayEnd: { type: Date, require: true },
        condition: { type: Number },
        visible: { type: Boolean },
    },
    {
        timestamps: true,
    },
)

export const PromotionModel = mongoose.model('Promotion', Promotion)
