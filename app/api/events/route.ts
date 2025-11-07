import {v2 as cloudinary} from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";




export async function POST(req: NextRequest) {
    try {
        // 1️⃣ Connect to MongoDB
        await connectToDatabase();

        // 2️⃣ Extract form data (works for multipart/form-data requests)
        const formData = await req.formData();

        // 3️⃣ Convert FormData entries into a plain object
        const event: Record<string, any> = Object.fromEntries(formData.entries());

        // 4️⃣ Convert JSON-like string fields into real arrays
        // agenda and tags are required arrays of strings in your schema
        const parseArrayField = (field: string) => {
            if (typeof event[field] === "string") {
                try {
                    // Try parsing it as JSON (e.g. '["a","b"]')
                    event[field] = JSON.parse(event[field]);
                } catch {
                    // Fallback: split comma-separated strings like "a, b, c"
                    event[field] = event[field]
                        .split(",")
                        .map((item: string) => item.trim())
                        .filter(Boolean);
                }
            }
        };

        parseArrayField("agenda");
        parseArrayField("tags");

        const file = formData.get("image") as File;

        if (!file) return NextResponse.json({message: "No image file found."},{status: 400});

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvent'}, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            }).end(buffer);
        })

        event.image = (uploadResult as { secure_url: string}).secure_url;




        // 5️⃣ Create the new event in the database
        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        // 6️⃣ Return success response
        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 }
        );

    } catch (e: any) {
        // 7️⃣ Error handling
        console.error(e);
        return NextResponse.json(
            {
                message: "Event Creation Failed",
                error: e instanceof Error ? e.message : "Unknown",
            },
            { status: 500 }
        );
    }
}

export async function GET(){
    try{
        await connectToDatabase();

        const  events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({message: "Event found successfully", events: events}, {status: 200});

    }catch (e){
        return NextResponse.json({message:"Event fetching failed", error: e}, {status: 500});
    }
}
