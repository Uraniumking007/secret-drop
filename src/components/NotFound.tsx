import { Link } from '@tanstack/react-router'

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                Go back home
            </Link>
        </div>
    )
}
