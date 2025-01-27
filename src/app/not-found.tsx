import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-2 p-4">
      {/* <FaceFrownIcon className="w-10 text-gray-400" /> */}
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p className="text-center">Could not find the requested resource.</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground 
        transition-colors hover:bg-primary/90"
      >
        Return Home
      </Link>
    </main>
  );
}
