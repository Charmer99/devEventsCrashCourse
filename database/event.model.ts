// database/event.model.ts
import { Schema, model, Document } from "mongoose";

/**
 * Strongly typed Event interface for Mongoose documents.
 */
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string; // normalized ISO date (YYYY-MM-DD)
    time: string; // normalized time (HH:MM, 24-hour)
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Helper: create a URL-friendly slug from a title.
 */
const makeSlug = (input: string): string =>
    input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // non-alphanum -> dash
        .replace(/^-+|-+$/g, "") // trim edge dashes
        .replace(/-{2,}/g, "-"); // collapse multiple dashes

/**
 * Helper: Normalize date to ISO date string YYYY-MM-DD.
 * Throws if invalid.
 */
const normalizeDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date format");
    // Return YYYY-MM-DD
    return d.toISOString().slice(0, 10);
};

/**
 * Helper: Normalize time to HH:MM (24-hour).
 * Accepts formats like "9:00 AM", "09:00", "9 AM", "21:30".
 * Throws if cannot parse.
 */
const normalizeTime = (timeStr: string): string => {
    const s = timeStr.trim();
    // Try direct HH:MM 24-hour
    const hhmm24 = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    if (hhmm24.test(s)) {
        const [, h, m] = s.match(hhmm24)!;
        return `${h.padStart(2, "0")}:${m}`;
    }

    // Match 12-hour like "9:30 AM" or "9 AM"
    const hhmm12 = /^([1-9]|1[0-2])(?::([0-5]\d))?\s*(am|pm)$/i;
    const m12 = s.match(hhmm12);
    if (m12) {
        let hour = parseInt(m12[1], 10);
        const minutes = m12[2] ?? "00";
        const period = m12[3]!.toLowerCase();
        if (period === "pm" && hour !== 12) hour += 12;
        if (period === "am" && hour === 12) hour = 0;
        return `${String(hour).padStart(2, "0")}:${minutes}`;
    }

    // Try parsing with Date fallback (some browser/node formats)
    const parsed = new Date(`1970-01-01T${s}`);
    if (!Number.isNaN(parsed.getTime())) {
        const hh = String(parsed.getHours()).padStart(2, "0");
        const mm = String(parsed.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }

    throw new Error("Invalid time format");
};

const eventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        date: { type: String, required: true }, // stored as ISO date string (YYYY-MM-DD)
        time: { type: String, required: true }, // stored as HH:MM (24-hour)
        mode: { type: String, required: true, trim: true },
        audience: { type: String, required: true, trim: true },
        agenda: { type: [String], required: true, validate: [(v: string[]) => v.length > 0, "Agenda cannot be empty"] },
        organizer: { type: String, required: true, trim: true },
        tags: { type: [String], required: true, validate: [(v: string[]) => v.length > 0, "Tags cannot be empty"] },
    },
    {
        timestamps: true, // createdAt & updatedAt
        strict: true,
    }
);

/**
 * Pre-save hook:
 * - Generate slug from title only when title changed.
 * - Normalize date to YYYY-MM-DD and time to HH:MM.
 * - Validate required fields are present and non-empty.
 */
eventSchema.pre<IEvent>("save", async function () {
    // Validate non-empty required strings
    const requiredStrings: (keyof IEvent)[] = [
        "title",
        "description",
        "overview",
        "image",
        "venue",
        "location",
        "date",
        "time",
        "mode",
        "audience",
        "organizer",
    ];
    for (const key of requiredStrings) {
        const value = (this as any)[key];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error(`${String(key)} is required and cannot be empty`);
        }
    }

    // Normalize date
    this.date = normalizeDate(this.date);

    // Normalize time
    this.time = normalizeTime(this.time);

    // Generate slug only if title modified (or slug empty)
    // isModified is available on documents
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Mongoose adds isModified on Document
    const titleModified = this.isModified ? this.isModified("title") : false;
    if (titleModified || !this.slug) {
        this.slug = makeSlug(this.title);
    }
});

export const Event = model<IEvent>("Event", eventSchema);
