'use client'
import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.action";
import posthog from "posthog-js";

const BookEvent = ({eventId, slug}: {eventId: 'string', slug: 'string'}) => {
const[email, setEmail] = useState("");
const[submittted, setSubmitted] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const {success} = await createBooking({eventId, slug, email})
    if(success) {
        setSubmitted(true);
        posthog.capture('event_booked', {eventId, slug, email})
    }else {
        console.log('Booking creation failed');
        posthog.captureException('Booking creation failed');
    }

    e.preventDefault();

    setTimeout(() =>
        setSubmitted(true))

}

  return (
    <div id="book-event">
        {submittted ? (
            <p className="text-sm">Thank you for signing up!</p>
        ):(
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>
                <button type="submit" >Submit</button>
            </form>
        )}
    </div>
  );
};

export default BookEvent;