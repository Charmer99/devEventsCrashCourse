// app/events/[slug]/page.tsx
import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = async ({ params }: { params: { slug: string } }) => {

    const { slug } = await params; // ✅ Unwrap the Promise

    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails slug={slug} />
            </Suspense>
        </main>
    );
};

export default EventDetailsPage;
