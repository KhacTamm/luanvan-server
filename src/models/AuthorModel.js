import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Author = new Schema(
    {
        // accountId: { type: Schema.Types.ObjectId, required: true, ref: 'account' },
        name: { type: String },
        image: { type: String },
        biography: { type: String },
        visible: Boolean,
        cloudinary_id: String,
    },
    {
        timestamps: true,
    },
)

export const AuthorModel = mongoose.model('Author', Author)
