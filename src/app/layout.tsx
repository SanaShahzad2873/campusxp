import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = { title: "CampusXP — Learn. Play. Level Up.", description: "Gamified Computer Science learning for Pakistani university students. Quiz battles, speed runs and code challenges in English and Urdu.", manifest: "/manifest.json", icons: { icon: "/icon.svg" } };
export const viewport: Viewport = { themeColor: "#090e22", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en" data-theme="dark"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    {/* eslint-disable-next-line @next/next/no-page-custom-font */}<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap" />
  </head><body className="antialiased">
    {children}
    <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator&&location.hostname!=='localhost'){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}` }} />
  </body></html>);
}
