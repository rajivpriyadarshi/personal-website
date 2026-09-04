/* What people Rajiv has worked with have said about him.
 *
 * Lifted out of `WordsSection.tsx` so the assistant can quote these too — same
 * bytes on the board and in the prompt. `tint` and `angle` come from the
 * design's alternating rhythm and are only used by the board. */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  linkedin: string;
  avatar: string;
  /** Note colour on the board. */
  tint: string;
  /** Resting angle on the board, in degrees. */
  angle: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    tint: "#e2c7ff",
    angle: -1.5,
    quote:
      "You are by far the #1 designer I have ever worked with. All the PMs I know always want to work only with you. Also you are the most fun friend to hang out with. All the dance parties all the outings have been lovely because your were there.",
    name: "Bhavik Kaul",
    role: "CPO, SuperMoney by Flipkart",
    linkedin: "https://www.linkedin.com/in/kaulbhavik/",
    avatar: "/portfolio-august/words/bhavik-kaul.jpeg",
  },
  {
    tint: "#b0e0e5",
    angle: 1.6,
    quote:
      "You are one of the biggest contributor to our progress so far. I will miss working with you. :)",
    name: "Ankush Singla",
    role: "Co-founder, Coding Ninjas",
    linkedin: "https://www.linkedin.com/in/ankushsingla/",
    avatar: "/portfolio-august/words/ankush-singla.jpeg",
  },
  {
    tint: "#c4edba",
    angle: 3.9,
    quote:
      "You have been very instrumental in what company is today. I wish I could hug you and say good bye and good luck. I am confident you would do great in your next challenge. Keep rocking ;)",
    name: "Uttam Digga",
    role: "Co-founder and CEO, Porter",
    linkedin: "https://www.linkedin.com/in/uttamdigga/",
    avatar: "/portfolio-august/words/uttam-digga.jpeg",
  },
  {
    tint: "#ffd1db",
    angle: -1.2,
    quote:
      "Your contribution has been phenomenal. Thanks for being always available and always solving more than asked.",
    name: "Shruti Anand",
    role: "Director of Technical Program Management, PayU",
    linkedin: "https://www.linkedin.com/in/anandshruti/",
    avatar: "/portfolio-august/words/shruti-anand.jpeg",
  },
  {
    tint: "#ffe9b8",
    angle: 2.4,
    quote:
      "Whenever Porter goes from here, it will always be indebted to the pivotal role you played in helping it grow.",
    name: "Ambuj Singh",
    role: "VP Engineering, Porter",
    linkedin: "https://www.linkedin.com/in/ambuj-singh-100b1663/",
    avatar: "/portfolio-august/words/ambuj-singh.jpeg",
  },
  {
    tint: "#cfe0ff",
    angle: -2.8,
    quote:
      "Rajiv has an eye for great design, and is one of the best designers I’ve worked with.",
    name: "Rahul Sharma",
    role: "Senior Director of Product, Smallcase",
    linkedin: "https://www.linkedin.com/in/rahulsharma1729/",
    avatar: "/portfolio-august/words/rahul-sharma.jpeg",
  },
];
