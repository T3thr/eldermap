// app/not-found.tsx
export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
        <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      </div>
    );
  }