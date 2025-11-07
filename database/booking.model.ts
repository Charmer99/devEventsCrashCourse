import {
    Schema,
    model,
    models,
    type HydratedDocument,
    type InferSchemaType,
    type Model,
    type Types,
} from "mongoose";
import { Event } from "./event.model";

// Basic RFC5322-lite email check; pragmatic and safe for server-side validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const BookingSchema = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true, // speed up lookups and aggregations by event
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string) => EMAIL_REGEX.test(v),
                message: "Invalid email format",
            },
        },
    },
    {
        timestamps: true, // adds createdAt/updatedAt
        versionKey: false,
        strict: true,
    }
);

// Verify that the referenced event exists before saving
BookingSchema.pre("save", async function (this: HydratedDocument<BookingType>, next) {
    try {
        const id: Types.ObjectId = this.eventId;

        const exists = await Event.exists({ _id: id });
        if (!exists) throw new Error("Referenced event does not exist");

        next();
    } catch (err : any) {
        next(err);
    }
});

export type BookingType = InferSchemaType<typeof BookingSchema>;
export type BookingDocument = HydratedDocument<BookingType>;

export const Booking: Model<BookingType> =
    (models.Booking as Model<BookingType>) || model<BookingType>("Booking", BookingSchema);