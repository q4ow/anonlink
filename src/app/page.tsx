import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import { URLShortener } from "@/components/shortener/URLShortener";
import ShareXUploader from "@/components/shortener/SharexUploader";

export default function Home() {
  return (
    <>
      <div className="mt-8 text-foreground">
        <Navbar />
        <main className="flex min-h-[70vh] flex-grow flex-col items-center justify-center">
          <Header />
          <div className="flex flex-col items-center">
            <URLShortener />
            <ShareXUploader />
          </div>
        </main>
      </div>
    </>
  );
}
