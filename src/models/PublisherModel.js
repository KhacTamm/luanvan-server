import mongoose from 'mongoose'

const Schema = mongoose.Schema

const PublisherSchema = new Schema(
    {
        name: String,
        img: String,
        cloudinary_id: String,
        visible: Boolean,
    },
    {
        timestamps: true,
    },
)

export const PublisherModel = mongoose.model('Publisher', PublisherSchema)
