// database/booking.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { Event } from "./event.model";

/**
 * Strongly typed Booking interface.
 */
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Simple email validation regex (reasonable production tradeoff).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
        email: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        strict: true,
    }
);

/**
 * Pre-save hook:
 * - Ensure email is valid.
 * - Verify referenced Event exists; throw if not.
 */
bookingSchema.pre<IBooking>("save", async function () {
    // Validate email format
    if (typeof this.email !== "string" || !EMAIL_RE.test(this.email)) {
        throw new Error("Invalid email format");
    }

    // Verify referenced event exists
    if (!Types.ObjectId.isValid(this.eventId)) {
        throw new Error("Invalid eventId");
    }

    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
        throw new Error("Referenced event does not exist");
    }
});

export const Booking = model<IBooking>("Booking", bookingSchema);
