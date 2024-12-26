import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import { URLShortener } from "@/components/shortener/URLShortener";
import ShareXUploader from "@/components/shortener/SharexUploader";

export default function Home() {
  return (
    <>
      <div className="text-foreground mt-8">
        <Navbar />
        <main className="flex-grow flex flex-col justify-center items-center min-h-[70vh]">
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
