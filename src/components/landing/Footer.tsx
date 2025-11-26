import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
            Ready to secure your workflow?
          </h2>

          <Link to="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-5 bg-primary text-primary-foreground text-xl font-bold rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-3">
                Get Started for Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Radioactive Glow */}
              <div className="absolute inset-0 rounded-full shadow-[0_0_50px_var(--color-primary)] opacity-50 group-hover:opacity-80 transition-opacity z-[-1]"></div>
            </motion.button>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12">
          <div>
            <h4 className="text-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">Social</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-muted-foreground text-sm mt-12">
          © {new Date().getFullYear()} Secretdrop. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
