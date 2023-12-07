import mongoose from 'mongoose'

const Schema = mongoose.Schema

const replieCommentProduct = new Schema(
    {
        content: { type: String },
        isAdmin: Boolean,
        nameUser: { type: String },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
    },
)

const commentProduct = new Schema(
    {
        author: { type: String },
        star: { type: Number },
        status: String,
        isAdmin: Boolean,
        avatar: { type: String },
        content: { type: String },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        replies: [replieCommentProduct],
    },
    {
        timestamps: true,
    },
)

const Product = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number },
        amount: { type: Number, require: true },
        salePrice: { type: Number, required: true },
        type: { type: String },
        publisher: { type: String, require: true },
        author: { type: String },
        image: { type: String, require: true },
        // property: {type: Array},

        cloudinary_id: { type: String },
        rating: { type: Number },
        numReviews: { type: Number },
        blog: String,

        comments: [commentProduct],

        size: String,
        page: String,
        datePublisher: String,
        detail: String,
        coverType: String,
        translator: String,
        visible: Boolean,

        // screen: String,
        // resolution: String,
        // disk: String,
        // card: String,

        // cameraAfter: String,
        // cameraBefore: String,
        // special: String,
        // design: String,
    },
    {
        timestamps: true,
    },
)
Product.index({ name: 'text' })

export const ProductModel = mongoose.model('Product', Product)
