import { motion } from 'motion/react'
import { FileText, Flame, Globe, Users } from 'lucide-react'

const features = [
  {
    title: 'Burn on Read',
    description:
      'Secrets are physically deleted from the database immediately after being viewed once.',
    icon: Flame,
    className: 'md:col-span-2',
    animation: 'flame',
  },
  {
    title: 'Team Vaults',
    description:
      'Organize secrets by project or team. Manage access with granular permissions.',
    icon: Users,
    className: 'md:col-span-1',
    animation: 'pulse',
  },
  {
    title: 'Audit Logs',
    description: 'Track every access attempt. See who viewed what and when.',
    icon: FileText,
    className: 'md:col-span-1',
    animation: 'scroll',
  },
  {
    title: 'IP Allow-listing',
    description: 'Restrict access to corporate VPNs or specific IP ranges.',
    icon: Globe,
    className: 'md:col-span-2',
    animation: 'static',
  },
]

export function FeatureGrid() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`relative group overflow-hidden rounded-2xl bg-card/50 backdrop-blur-md border border-border p-8 hover:border-primary/50 transition-colors duration-500 ${feature.className}`}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-primary group-hover:scale-110 transition-transform duration-500">
                  {feature.animation === 'flame' ? (
                    <motion.div
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.9, 1.1, 0.9],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <feature.icon className="w-6 h-6" />
                    </motion.div>
                  ) : feature.animation === 'pulse' ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <feature.icon className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <feature.icon className="w-6 h-6" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {feature.animation === 'scroll' && (
                  <div className="mt-6 h-24 overflow-hidden relative rounded bg-background border border-border p-2 font-mono text-xs text-green-500/70">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none"></div>
                    <motion.div
                      animate={{ y: [0, -100] }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      {[...Array(10)].map((_, j) => (
                        <div key={j} className="mb-1">
                          <span className="text-muted-foreground">
                            [{new Date().toLocaleTimeString()}]
                          </span>{' '}
                          Access granted: 192.168.1.{10 + j}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
