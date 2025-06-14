import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-4">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Go back home
      </Link>
    </div>
  );
} 