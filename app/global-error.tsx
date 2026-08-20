"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#060605] px-4 text-[#e8dcc8]">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#6b7178]">The page failed to load. Try refreshing.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-sm bg-[#a8894a] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#060605]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
