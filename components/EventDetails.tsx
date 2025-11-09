import { notFound } from 'next/navigation';
import Image from 'next/image';
import BookEvent from '@/components/BookEvent';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database/event.model';
import { getSimilarEventsBySlug } from '@/lib/actions/events.actions';
import { cacheLife } from 'next/cache';

const EventDetailsItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>
                {tag}
            </div>
        ))}
    </div>
);

async function EventDetails({ slug }: { slug: string }) {
    'use cache';
    cacheLife('hours');



    await connectDB();
    const event = await Event.findOne({ slug: slug.trim().toLowerCase() }).lean();
    if (!event) return notFound();

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    const bookings = 10;
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);


    return (
        <section id={"event"}>
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/* Left side - Event content */}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailsItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailsItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />

                    {/* Similar events */}
                    <div className="flex w-full flex-col gap-4 pt-20">
                        <h2>Similar Events</h2>
                        {similarEvents.length > 0 &&
                            similarEvents.map((similarEvent: IEvent) => (
                                <EventCard key={similarEvent.title} {...(similarEvent as any)} />
                            ))}
                    </div>
                </div>

                {/* Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book your spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">Join {bookings} people who have already booked their spot.</p>
                        ) : (
                            <p className="text-sm"> Be the first to book your spot </p>
                        )}

                        <BookEvent eventId={String(event._id)} slug={event.slug} />

                    </div>
                </aside>
            </div>
        </section>
    );
}

export default EventDetails;