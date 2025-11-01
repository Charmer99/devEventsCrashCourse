// lib/constants.ts

export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    title: "React Summit 2025",
    image: "/images/event1.png",
    slug: "react-summit-2025",
    location: "Amsterdam, Netherlands",
    date: "June 13-17, 2025",
    time: "9:00 AM - 6:00 PM CEST",
  },
  {
    title: "AI Engineering World's Fair",
    image: "/images/event2.png",
    slug: "ai-engineering-worlds-fair",
    location: "San Francisco, CA",
    date: "June 25-27, 2025",
    time: "10:00 AM - 7:00 PM PST",
  },
  {
    title: "Web3 Builders Hackathon",
    image: "/images/event3.png",
    slug: "web3-builders-hackathon",
    location: "Austin, TX",
    date: "July 10-12, 2025",
    time: "8:00 AM - 8:00 PM CST",
  },
  {
    title: "Next.js Conf",
    image: "/images/event4.png",
    slug: "nextjs-conf-2025",
    location: "San Francisco, CA",
    date: "October 24, 2025",
    time: "9:00 AM - 5:00 PM PST",
  },
  {
    title: "DevOps Days London",
    image: "/images/event5.png",
    slug: "devops-days-london",
    location: "London, UK",
    date: "September 18-19, 2025",
    time: "8:30 AM - 6:00 PM BST",
  },
  {
    title: "TypeScript Congress",
    image: "/images/event6.png",
    slug: "typescript-congress-2025",
    location: "New York, NY",
    date: "November 5-6, 2025",
    time: "9:00 AM - 6:00 PM EST",
  },
];
