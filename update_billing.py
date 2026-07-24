with open('/tmp/Billing.tsx.bak', 'r') as f:
    content = f.read()

content = content.replace(
    'import { Check, X, Star, ExternalLink, Zap } from',
    'import { Check, X, Star, ExternalLink, Zap, BadgeCheck } from'
)

banner = '''// ─── Best First Purchase Banner ───

function BestFirstPurchaseBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className=\
relative
overflow-hidden
rounded-2xl
p-5
md:p-6
mb-8\
      style={{
        background: 'linear-gradient(135deg, var(--color-accent-subtle) 0%, oklch(0.74 0.12 195 / 0.12) 100%)',
        border: '1px solid oklch(0.74 0.12 195 / 0.35)',
      }}
    >
      <div className=\relative
z-10
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-4\>
        <div className=\flex
items-center
gap-3\>
          <div
            className=\flex
items-center
justify-center
w-10
h-10
rounded-xl
flex-shrink-0\
            style={{ background: 'var(--color-accent-base)', color: 'white' }}
          >
            <BadgeCheck className=\w-5
h-5\ style={{ color: 'white' }} />
          </div>
          <div>
            <h3 className=\text-title
font-semibold\ style={{ color: 'var(--color-text-primary)' }}>
              Best first purchase
            </h3>
            <p className=\text-sm
mt-0.5\ style={{ color: 'var(--color-text-secondary)' }}>
              <strong> for 1,000 credits</strong> — no subscription needed, never expires, stacks on any plan
            </p>
          </div>
        </div>
        <div className=\flex
items-center
justify-end
md:justify-center
gap-3\>
          <BadgeCheck className=\w-4
h-4
flex-shrink-0\ style={{ color: 'var(--color-success)' }} />
          <span className=\text-sm
font-medium\ style={{ color: 'var(--color-text-secondary)' }}>
            Perfect for testing agent workloads
          </span>
          <Link to=\/buy?sku=credits_1k\ className=\btn
btn-primary
text-sm\>
            <Zap className=\w-3.5
h-3.5\ />
            Buy  pack
          </Link>
        </div>
      </div>
      <div className=\absolute
inset-0
overflow-hidden
pointer-events-none\ aria-hidden=\true\>
        <div className=\absolute
-top-10
-right-10
w-40
h-40
rounded-full
opacity-10\ style={{ background: 'var(--color-accent-base)' }} />
        <div className=\absolute
-bottom-20
-left-20
w-60
h-60
rounded-full
opacity-5\ style={{ background: 'var(--color-accent-base)' }} />
      </div>
    </motion.div>
  );
}

'''

content = content.replace('// ─── Usage Bar ───', banner + '// ─── Usage Bar ───')

old_header = '''<PageHeader
        title=\Billing\
        description=\Manage
your
plan
buy
credit
packs
and
view
invoices.\
      />'''

new_header = '''<PageHeader
        title=\Billing\
        description=\Manage
your
plan
buy
credit
packs
that
never
expire
and
view
invoices.\
        action={
          <Link to=\/buy?sku=credits_1k\ className=\btn
btn-primary
text-sm\>
            <Zap className=\w-3.5
h-3.5\ />
            Buy 1,000 credits for 
          </Link>
        }
      />
      <BestFirstPurchaseBanner />
      <section className=\mb-10\ aria-labelledby=\current-plan-heading\>
        <h2 id=\current-plan-heading\ className=\sr-only\>Current plan</h2>'''

content = content.replace(old_header, new_header)

old_fallback = '''<div
            className=\rounded-xl
p-8
text-center\
            style={{ border: '1px dashed var(--color-border-default)' }}
          >
            <p className=\text-sm\ style={{ color: 'var(--color-text-tertiary)' }}>
              Subscription pricing temporarily unavailable.
            </p>
            <p className=\mt-1
text-xs\ style={{ color: 'var(--color-text-disabled)' }}>
              Credit packs above still work via Polar checkout.
            </p>
            <Link to=\/pricing\ className=\btn
btn-secondary
mt-4
text-xs\>
              View public pricing
            </Link>
          </div>'''

new_fallback = '''<div
            className=\rounded-xl
p-8
text-center\
            style={{ border: '1px dashed var(--color-border-default)' }}
          >
            <p className=\text-sm\ style={{ color: 'var(--color-text-tertiary)' }}>
              Subscription pricing temporarily unavailable.
            </p>
            <p className=\mt-1
text-xs\ style={{ color: 'var(--color-text-disabled)' }}>
              Credit packs above still work via Polar checkout.
            </p>
            <div className=\flex
gap-2\>
              <Link to=\/pricing\ className=\btn
btn-secondary
text-sm\>
                View public pricing
              </Link>
              <Link to=\/buy?sku=credits_1k\ className=\btn
btn-primary
text-sm\>
                <Zap className=\w-3.5
h-3.5\ />
                Buy 1,000 credits for 
              </Link>
            </div>
          </div>'''

content = content.replace(old_fallback, new_fallback)

with open('src/dashboard/src/pages/Billing.tsx', 'w') as f:
    f.write(content)

print('Done')
