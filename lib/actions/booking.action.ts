'use server'

import {strict} from "node:assert";
import ConnectDB from "@/lib/mongodb";
import {Booking} from "@/database";

export const createBooking = async ({eventId, slug, email}: {eventId: string; slug: string; email: string}) => {
    try {
        await ConnectDB();
        await Booking.create({eventId, slug, email})

        return {success: true};
    } catch(e) {
        console.error('create booking failed', e);
        return { success: false}
    }
}