import mongoose  from 'mongoose';

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    businessName: String,
    gstNumber: String,
    shopAddress: String,
    approved: { type: Boolean, default: false },

    panCardNumber: String,
    panCardImage: String,
    panCardImageId: String, 

    aadhaarNumber: String,
    aadhaarImage: String,
    aadhaarImageId: String, 

    paymentHistory: [
        {
            paymentId: String,
            orderIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            }],
            amount: Number,
            paymentDate: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ["pending", "completed", "failed"],
                default: "pending"
            }
        }
    ],

    earnings: {
        totalEarnings: { type: Number, default: 0 },
        pendingAmount: { type: Number, default: 0 }
    },

    ordersReceived: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    }
});
export const Seller = mongoose.model('Seller', sellerSchema);
