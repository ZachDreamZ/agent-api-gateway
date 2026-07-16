import { readFileSync, writeFileSync } from 'fs';
const path = 'src/dashboard/src/pages/AuraLanding.tsx';
let content = readFileSync(path, 'utf8');

// 1. Hero — replace with staggerVariants
const heroStart = content.indexOf('function Hero()');
const heroEnd = content.indexOf('\n// ─── API Demo');
const heroSection = content.substring(heroStart, heroEnd);

const newHero = `function Hero() {
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="pt-32 pb-20 px-6 text-center relative z-10 overflow-hidden">
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={childVariants}
          className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tight leading-[0.95] max-w-4xl mx-auto"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Your API.{" "}
          <span style={{ color: 'var(--color-accent-base)' }}>Revitalized.</span>
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mt-6 max-w-lg mx-auto text-sm leading-relaxed xl:max-w-xl xl:text-base 2xl:max-w-2xl 2xl:text-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          One endpoint for structured web data. AI agents send a URL and schema type,
          get clean JSON back. No parsing, no markdown — just the fields you need.
        </motion.p>

        <motion.div
          variants={childVariants}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Link to="/dashboard">
            <button className="btn btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
              Get Started Free
            </button>
          </Link>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>1,500 free queries/month · No credit card</span>
        </motion.div>
      </motion.div>
    </section>
  );
}`;

content = content.replace(heroSection, newHero);

// 2. Features — whileInView on each card
const oldFeatCard = `            <div key={feat.label} className="surface surface-hover p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{feat.label}</span>
                <span className="badge badge-active">{feat.tag}</span>
              </div>
              <ul className="space-y-1">
                {feat.items.map((item) => (
                  <li key={item} className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item}</li>
                ))}
              </ul>
            </div>`;

const newFeatCard = `            <motion.div
              key={feat.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="surface surface-hover p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{feat.label}</span>
                <span className="badge badge-active">{feat.tag}</span>
              </div>
              <ul className="space-y-1">
                {feat.items.map((item) => (
                  <li key={item} className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item}</li>
                ))}
              </ul>
            </motion.div>`;

content = content.replace(oldFeatCard, newFeatCard);

// 3. LogoCloud — whileInView stagger
const oldLogo = `            <div
            key={name}
            className="text-sm font-bold tracking-tight text-center cursor-default"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            {name}
          </div>`;

const newLogo = `            <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm font-bold tracking-tight text-center cursor-default"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            {name}
          </motion.div>`;

// Need to change the map to include index
content = content.replace(
  `{logos.map((name) => (`,
  `{logos.map((name, idx) => (`
);

content = content.replace(oldLogo, newLogo);

// Also animate the LogoCloud subtitle text
content = content.replace(
  `<p className="text-xs uppercase tracking-widest text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        Used by engineering teams shipping structured data products`,
  `<motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-xs uppercase tracking-widest text-center"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Used by engineering teams shipping structured data products`
);
// Close the motion.p
content = content.replace(
  `</p>
      </section>
    );
  }

// ─── Testimonials ───`,
  `</motion.p>
      </section>
    );
  }

// ─── Testimonials ───`
);

// 4. Testimonials — whileInView
const oldTestimonial = `          <div key={t.name} className="surface p-6">
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>"{t.quote}"</p>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t.role}</p>
            </div>
          </div>`;

const newTestimonial = `          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface p-6"
          >
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>"{t.quote}"</p>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t.role}</p>
            </div>
          </motion.div>`;

content = content.replace(oldTestimonial, newTestimonial);

// 5. Decorative ambient orbs — inserted inside the Landing root div
// Find the landing page's root div and add orbs after it
const rootDivIdx = content.indexOf('<div style={{ background:');
if (rootDivIdx !== -1) {
  const closeBracketMatch = content.substring(rootDivIdx).match(/>/);
  if (closeBracketMatch) {
    const insertPos = rootDivIdx + closeBracketMatch.index + 1;
    const orbs = `
      {/* Decorative ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.5 0.2 260 / 0.08), transparent 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.6 0.2 200 / 0.06), transparent 70%)' }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.7 0.15 300 / 0.05), transparent 70%)' }}
          animate={{ x: [0, 25, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>`;
    content = content.substring(0, insertPos) + orbs + content.substring(insertPos);
  }
}

writeFileSync(path, content, 'utf8');
console.log('Done writing AuraLanding.tsx');
console.log('Lines:', content.split('\n').length);
