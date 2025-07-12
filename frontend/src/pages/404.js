import Head from 'next/head';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Swapr</title>
      </Head>

      
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 transition-all duration-300 animate-fade-in">
          <h1 className="text-6xl font-extrabold text-blue-600 tracking-tight mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">
            The page you're looking for doesn’t exist, was moved, or never existed.
          </p>

          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow hover:shadow-lg transition duration-300"
          >
            ← Go Back Home
          </a>
        </div>
    </>
  );
}
