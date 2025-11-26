import { motion } from 'motion/react'
import { Server, Shield, User } from 'lucide-react'

export function Pipeline() {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it Works
          </h2>
          <p className="text-muted-foreground">
            Zero-knowledge architecture ensures we never see your data.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border hidden md:block -translate-y-1/2 z-0"></div>

          {/* Moving Packet */}
          <motion.div
            className="absolute top-1/2 left-0 w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_var(--color-primary)] z-10 hidden md:block"
            animate={{
              left: ['0%', '50%', '100%'],
              backgroundColor: ['#ef4444', 'var(--color-primary)', '#22c55e'], // Red (Unsafe) -> Blue (Encrypted) -> Green (Decrypted)
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.5, 1],
            }}
            style={{ translateY: '-50%' }}
          />

          {/* Steps */}
          {[
            {
              icon: Shield,
              title: 'Encryption',
              desc: 'Client-side AES-256',
              color: 'text-primary',
            },
            {
              icon: Server,
              title: 'Storage',
              desc: 'Encrypted Blob Stored',
              color: 'text-purple-400',
            },
            {
              icon: User,
              title: 'Decryption',
              desc: 'Key never leaves browser',
              color: 'text-green-400',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative z-20 flex flex-col items-center bg-background p-4 md:p-0"
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-xl ${step.color}`}
              >
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-[150px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
