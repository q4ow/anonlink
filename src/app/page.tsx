import Navbar from "@/components/layout/Navbar";
import { URLShortener } from "@/components/shortener/URLShortener";

export default function Home() {
  return (
    <>
      <div className="bg-background text-foreground p-4">
        <Navbar />
        <main className="container mx-auto mt-8">
          <h1 className="text-3xl font-bold text-center mb-8">AnonLink</h1>
          <URLShortener />
        </main>
      </div>
    </>
  );
}
