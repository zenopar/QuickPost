import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-neutral-300 mb-6">Page not found</h2>
      <p className="text-neutral-400 mb-8 text-center max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-md font-medium text-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
