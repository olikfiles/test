'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const milestones = [
  {
    year: '2010',
    title: 'The First Table',
    body:
      'Founded by chef Aino Virtanen and sommelier Mikael Lehtonen in a tiny 24-seat space in Kallio, Helsinki. The first menu was handwritten. The waiting list grew to three months within weeks.',
  },
  {
    year: '2013',
    title: 'A Star Is Earned',
    body:
      'The Michelin Guide awarded SYÖ & JUO its first star—recognising not just the food, but an entirely new philosophy of hospitality rooted in calm precision and Nordic identity.',
  },
  {
    year: '2017',
    title: 'At Home Is Born',
    body:
      'During a snowstorm that shuttered Helsinki for three days, Aino began cooking for neighbours. That act of generosity became the blueprint for our curated at-home experience—restaurant quality, zero compromise.',
  },
  {
    year: '2021',
    title: 'The New Address',
    body:
      'We moved to our current home on Pohjoisesplanadi, a 60-seat dining room designed with architect Leena Mäkinen. Every surface chosen to let the food be the only spectacle.',
  },
  {
    year: 'Today',
    title: 'Still the Same Promise',
    body:
      'Two stars. A national delivery footprint. And the same belief we started with: that exceptional cooking has nothing to do with occasion, and everything to do with care.',
  },
];

const values = [
  {
    title: 'Provenance',
    body: 'Every ingredient carries a postcode. We work with fewer than thirty suppliers—most within 200 km—because trust is built at close range.',
  },
  {
    title: 'Restraint',
    body: 'We do not add what is not needed. A dish earns its components one at a time. Complexity that cannot be tasted is vanity.',
  },
  {
    title: 'Access',
    body: 'A Michelin star should not be a gatekeeper. Our at-home menu exists because everyone deserves one genuinely extraordinary meal.',
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

export default function StoryPage() {
  return (
    <div className="bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="min-h-[80vh] flex items-end relative overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000&auto=format&fit=crop"
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 w-full">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold tracking-[0.25em] uppercase text-white/60 mb-6"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-bold text-5xl lg:text-8xl text-white leading-[1.05] pb-2 max-w-3xl"
          >
            Cooking as a<br />form of care.
          </motion.h1>
        </div>
      </section>

      {/* ── FOUNDING STATEMENT ── */}
      <section className="py-32 max-w-4xl mx-auto px-6">
        <FadeIn>
          <p className="text-2xl lg:text-3xl text-foreground leading-relaxed font-light">
            SYÖ & JUO — "Eat & Drink" in Finnish — was never meant to be a fine-dining restaurant. It was meant to be the truest possible expression of Nordic hospitality: generosity without performance, skill without ego.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-lg text-gray-500 mt-8 leading-relaxed max-w-2xl">
            What it became, over fifteen years and two Michelin stars, is proof that those two ideas are not in conflict. That a kitchen built on restraint can also be one of the most exciting places to eat in Northern Europe.
          </p>
        </FadeIn>
      </section>

      {/* ── PORTRAITS ── */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop"
                alt="Head chef at work"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="max-w-lg">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-6">The Founders</p>
              <h2 className="font-display font-bold text-4xl mb-6 pb-1">Aino & Mikael</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Aino Virtanen spent six years in Copenhagen and Lyon before returning to Finland with a single conviction: that Finnish cooking had been underestimating itself for decades.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed">
                Mikael Lehtonen had built a wine list at a three-star restaurant in Paris. He came home because Aino called him and said the idea was too good to do with anyone else.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <FadeIn>
          <h2 className="font-display font-bold text-4xl mb-20 pb-1">A timeline of moments.</h2>
        </FadeIn>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[3.5rem] top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
          <div className="space-y-16">
            {milestones.map((m, i) => (
              <FadeIn key={m.year} delay={i * 0.08}>
                <div className="flex gap-10 items-start">
                  <div className="shrink-0 w-28 text-right hidden md:block">
                    <span className="font-display font-bold text-primary text-xl">{m.year}</span>
                  </div>
                  <div className="relative hidden md:flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-background z-10" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-bold tracking-widest text-xs uppercase text-primary mb-1 md:hidden">{m.year}</p>
                    <h3 className="font-display font-bold text-2xl mb-3 pb-0.5">{m.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-32 bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mb-20 pb-1">What we believe.</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div className="border-t border-white/20 pt-8">
                  <h3 className="font-display font-bold text-2xl mb-4 pb-0.5 text-white">{v.title}</h3>
                  <p className="text-white/60 leading-relaxed">{v.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 text-center max-w-2xl mx-auto px-6">
        <FadeIn>
          <h2 className="font-display font-bold text-4xl mb-8 pb-1">Come to the table.</h2>
          <p className="text-gray-500 text-lg mb-12">
            Whether you join us in the dining room or we bring the kitchen to you, the promise is the same.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Reserve a Table
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-foreground text-foreground font-semibold rounded-full hover:bg-foreground hover:text-white transition-colors"
            >
              Explore the Menu
            </Link>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
