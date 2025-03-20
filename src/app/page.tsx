import Navbar from "@/components/layout/Navbar";
import { URLShortener } from "@/components/shortener/URLShortener";

export default function Home() {
  return (
    <>
      <div className="mt-8 text-foreground">
        <Navbar />
        <main className="flex min-h-[calc(75vh-theme(spacing.8))] flex-grow flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <URLShortener />
          </div>
        </main>
      </div>
    </>
  );
}
