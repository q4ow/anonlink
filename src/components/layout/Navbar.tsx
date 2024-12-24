import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <div className="border-2 border-border flex justify-between items-center rounded-lg max-w-3xl mx-auto mb-8 bg-opacity-50 bg-background text-foreground p-4">
        <h1 className="text-2xl font-bold">Anonlove</h1>
        <div className="flex space-x-4 items-center">
          <Link href="/" passHref>
            <button className="px-4 py-2 rounded hover:bg-foreground/10 transition-all duration-150 ease-linear">
              AnonLink
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}