import {
    Schema,
    model,
    models,
    type HydratedDocument,
    type InferSchemaType,
    type Model,
} from "mongoose";

// Generate a URL-safe slug from a title (lowercase, ASCII, hyphen-separated)
function toSlug(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .normalize("NFKD") // decompose accents
        .replace(/[\u0300-\u036f]/g, "") // strip diacritics
        .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> '-'
        .replace(/-{2,}/g, "-") // collapse dashes
        .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

// Normalize a date string to ISO calendar date (YYYY-MM-DD)
function normalizeISODateStr(input: string): string {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
        throw new Error("Invalid date: must be parseable to a valid calendar date");
    }
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = d.getUTCDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// Normalize time to 24h HH:mm (accepts 'H:mm', 'HH:mm', 'h:mm am/pm', 'h am/pm', 'HH:mm:ss')
function normalizeTime24h(input: string): string {
    const s = input.trim().toLowerCase();
    const match = s.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?$/i);
    if (!match) throw new Error("Invalid time: expected formats like 'HH:mm' or 'h:mm am/pm'");

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3]?.toLowerCase();

    if (meridiem) {
        if (hours < 1 || hours > 12) throw new Error("Invalid hour in 12h time");
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
    } else if (hours < 0 || hours > 23) {
        throw new Error("Invalid hour in 24h time");
    }
    if (minutes < 0 || minutes > 59) throw new Error("Invalid minutes in time");

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

const EventSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, index: true, unique: true }, // generated in pre-save
        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        date: { type: String, required: true, trim: true }, // normalized to YYYY-MM-DD
        time: { type: String, required: true, trim: true }, // normalized to HH:mm (24h)
        mode: { type: String, required: true, trim: true },
        audience: { type: String, required: true, trim: true },
        agenda: {
            type: [String],
            required: true,
            set: (arr: string[]) => arr.map((s) => s.trim()),
            validate: {
                validator: (arr: unknown) =>
                    Array.isArray(arr) && arr.length > 0 && arr.every((v) => typeof v === "string" && v.trim().length > 0),
                message: "agenda must be a non-empty array of non-empty strings",
            },
        },
        organizer: { type: String, required: true, trim: true },
        tags: {
            type: [String],
            required: true,
            set: (arr: string[]) => arr.map((s) => s.trim().toLowerCase()),
            validate: {
                validator: (arr: unknown) =>
                    Array.isArray(arr) && arr.length > 0 && arr.every((v) => typeof v === "string" && v.trim().length > 0),
                message: "tags must be a non-empty array of non-empty strings",
            },
        },
    },
    {
        timestamps: true, // adds createdAt/updatedAt (Date)
        versionKey: false,
        strict: true,
    }
);

// Ensure uniqueness at the storage level
EventSchema.index({ slug: 1 }, { unique: true });

// Generate slug and normalize date/time before saving
EventSchema.pre("save", function (this: HydratedDocument<EventType>, next) {
    try {
        if (this.isModified("title") || !this.slug) {
            this.slug = toSlug(this.title);
            if (!this.slug) throw new Error("Unable to generate slug from title");
        }

        if (this.isModified("date")) {
            this.date = normalizeISODateStr(this.date);
        }

        if (this.isModified("time")) {
            this.time = normalizeTime24h(this.time);
        }

        // Guard: enforce presence of required trimmed strings (in addition to schema-level required)
        const requiredStrings: Array<keyof Pick<EventType, "title" | "description" | "overview" | "image" | "venue" | "location" | "mode" | "audience" | "organizer">> = [
            "title",
            "description",
            "overview",
            "image",
            "venue",
            "location",
            "mode",
            "audience",
            "organizer",
        ];
        for (const key of requiredStrings) {
            const val = (this as any)[key] as string; // local-only narrowed access
            if (typeof val !== "string" || val.trim().length === 0) {
                throw new Error(`${String(key)} is required`);
            }
        }

        next();
    } catch (err) {
        next(err as Error);
    }
});

export type EventType = InferSchemaType<typeof EventSchema>;
export type EventDocument = HydratedDocument<EventType>;

export const Event: Model<EventType> =
    (models.Event as Model<EventType>) || model<EventType>("Event", EventSchema);

export class IEvent {
}