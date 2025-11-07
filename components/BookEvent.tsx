'use client'
import {useState} from "react";


const BookEvent = () => {
const[email, setEmail] = useState("");
const[submittted, setSubmitted] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
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