import React from 'react';
import { Link } from '@tanstack/react-router';
import { Info } from 'lucide-react';

interface LegalLayoutProps {
    children: React.ReactNode;
    title: string;
    lastUpdated: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column (Sticky Sidebar) */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                                    Legal & Transparency
                                </h3>
                                <nav className="space-y-2">
                                    <Link
                                        to="/privacy"
                                        activeProps={{ className: "text-primary bg-primary/5" }}
                                        className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        to="/terms"
                                        activeProps={{ className: "text-primary bg-primary/5" }}
                                        className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                    >
                                        Terms of Service
                                    </Link>
                                </nav>
                            </div>

                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <Info className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Did you know?</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Secretdrop uses client-side encryption. We physically cannot see your secrets.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column (Content) */}
                    <main className="lg:col-span-9">
                        <div className="mb-8 pb-8 border-b border-border">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                                {title}
                            </h1>
                            <div className="mt-6 flex items-center text-sm text-muted-foreground">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                Last Updated: {lastUpdated}
                            </div>
                        </div>

                        <div className="prose prose-invert prose-headings:font-sans prose-p:font-sans max-w-none">
                            {children}
                        </div>

                        {/* Mobile Footer for Navigation */}
                        <div className="lg:hidden mt-12 pt-8 border-t border-border">
                            <div className="flex flex-col gap-4 mb-8">
                                <h4 className="font-semibold text-foreground">Legal Menu</h4>
                                <Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
                                <Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} Secretdrop. All rights reserved.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
