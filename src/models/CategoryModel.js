import mongoose from 'mongoose'

const Schema = mongoose.Schema

const CategoryShema = new Schema(
    {
        name: String,
        visible: Boolean,
    },
    {
        timestamps: true,
    },
)

export const CategoryModel = mongoose.model('Category', CategoryShema)
