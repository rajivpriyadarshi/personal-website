import localFont from "next/font/local";

export const ppEditorial = localFont({
  src: [
    {
      path: "./PPEditorialNew-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./PPEditorialNew-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./PPEditorialNew-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});

export const sohne = localFont({
  src: [
    {
      path: "./Sohne-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Sohne-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Sohne-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-sohne",
  display: "swap",
});
