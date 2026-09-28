export default function RootNotFound() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <a href="/dashboard" className="mt-2 text-sm text-primary hover:underline">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
