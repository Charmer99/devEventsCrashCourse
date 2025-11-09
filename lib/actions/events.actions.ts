'use server';

import connectDB from "@/lib/mongodb";
import { Event, IEvent } from "@/database/event.model";

/** Fetch all events */
export const getAllEvents = async (): Promise<IEvent[]> => {
    await connectDB();
    return await Event.find().lean();
};

/** Fetch events similar to a given slug */
export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).lean();
        if (!event) return [];

        return await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        }).lean();
    } catch (e) {
        console.error("Error in getSimilarEventsBySlug:", e);
        return [];
    }
};
