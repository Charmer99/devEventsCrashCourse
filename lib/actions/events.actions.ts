'use server'

import {Event} from '@/database/event.model'


import connectDB from "@/lib/mongodb";
import { Event } from "@/lib/models/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try{
        await connectDB();

        const event = await Event.findOne({slug});
        return await Event.find({_id: {$ne: event._id },tags:{$in: event.tags}}).lean();


    }catch (e){
        return [];
    }
}
export const getAllEvents = async () => {
    await connectDB();
    const events = await Event.find().lean();
    return events;
};