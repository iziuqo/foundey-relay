import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import QRCode from 'qrcode'
import { Truck, Package, UserRound, ShieldAlert, Clock } from 'lucide-react'
import { SlideFrame } from './SlideFrame'
import { LiveEmbed } from './LiveEmbed'
import { WorkWireframe } from './wireframes/WorkWireframe'
import { TeamWireframe } from './wireframes/TeamWireframe'
import WorkPage from '../pages/Work'
import TeamPage from '../pages/Team'
import { PriorityIcon } from '../components/PriorityIcon'
import { Chip } from '../components/Chip'
import { copy } from '../copy'
import currentDashboard from '../../plan/research/current-dashboard.png'

const ONE_HOUR = 'THE ONE HOUR ANSWER'
const EXTENSION = 'EXTENSION: BEYOND THE ONE HOUR ASK'

// ---------- shared bits ----------

function Callout({ n, text, style }: { n: number; text: string; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, ...style }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: 'var(--n-900)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 22, lineHeight: '30px', color: 'var(--n-700)', paddingTop: 4 }}>{text}</span>
    </div>
  )
}

function Title({ children, size = 56 }: { children: ReactNode; size?: number }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: size, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 48, marginTop: 0 }}>
      {children}
    </h2>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 22, lineHeight: '32px', color: 'var(--n-600)', maxWidth: 1200 }}>{children}</p>
}

// ---------- slide 1: cover ----------

function Slide01() {
  return (
    <SlideFrame noFooter>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40 }}>
          <svg width={96} height={96} viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="6" fill="var(--n-900)" />
            <rect x="5" y="4" width="10" height="2" rx="1" fill="#FFFFFF" />
            <rect x="5" y="9" width="7" height="2" rx="1" fill="#FFFFFF" />
            <rect x="5" y="14" width="4" height="2" rx="1" fill="#FFFFFF" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 600, letterSpacing: '-0.02em' }}>Relay</span>
        </div>
        <p style={{ fontSize: 28, lineHeight: '38px', color: 'var(--n-600)', maxWidth: 1000 }}>
          Making the next right action obvious, for the people doing the work and the people leading it.
        </p>
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, fontSize: 18, color: 'var(--n-500)' }}>
        Foundey Senior Product Designer challenge · Izaias · September 2026
      </div>
    </SlideFrame>
  )
}

// ---------- slide 2: short answer ----------

const SHORT_ANSWER_ROWS = [
  'People don’t need a longer list. They need to know what to do first, and why.',
  'We sort work into three groups by time, show one task at the top, and explain every rank in plain words.',
  'Managers see the same work, so they can spot risk and move work. They never see a stopwatch on people.',
]

function Slide02() {
  return (
    <SlideFrame slideNumber={2} eyebrow={ONE_HOUR}>
      <Title>If you only see one slide</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1300 }}>
        {SHORT_ANSWER_ROWS.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 32, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600, color: 'var(--n-300)', width: 80 }}>{i + 1}</span>
            <span style={{ fontSize: 28, lineHeight: '38px' }}>{text}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 3: the brief ----------

function QuoteCard({ quote, label }: { quote: string; label: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-1)', padding: 40 }}>
      <p style={{ fontSize: 30, lineHeight: '40px', fontWeight: 500, marginBottom: 24 }}>{quote}</p>
      <p style={{ fontSize: 18, color: 'var(--n-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    </div>
  )
}

function Slide03() {
  return (
    <SlideFrame slideNumber={3} eyebrow={ONE_HOUR}>
      <Title>Two complaints, one screen</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        <QuoteCard quote="I never know what needs my attention first." label="Workers" />
        <QuoteCard quote="I cannot see what each worker is doing." label="Managers" />
      </div>
      <Caption>The challenge asks us to rank individual work from most critical to least urgent.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 4: current dashboard ----------

const SLIDE_04_CALLOUTS = [
  'Ranked by urgency, but it never says why.',
  'Every row is labeled by where it came from.',
  'Four equal cards below repeat the same work.',
]

function Slide04() {
  return (
    <SlideFrame slideNumber={4} eyebrow={ONE_HOUR}>
      <Title size={48}>It already has a ranked list</Title>
      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        <div style={{ flex: 1.4, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--e-2)', border: '1px solid var(--n-200)' }}>
          <img src={currentDashboard} alt="The current dashboard" style={{ width: '100%', display: 'block' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 16 }}>
          {SLIDE_04_CALLOUTS.map((text, i) => (
            <Callout key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 5: statement ----------

function Slide05() {
  return (
    <SlideFrame slideNumber={5} eyebrow={ONE_HOUR} dark>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 600, letterSpacing: '-0.01em', maxWidth: 1400, lineHeight: '84px' }}>
          Sorting is not the same as knowing what to do.
        </p>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 6: five reasons ----------

const FIVE_REASONS: [string, string][] = [
  ['No reason.', 'The list is ranked, but nobody can see why, so nobody trusts it.'],
  ['Wrong labels.', 'Order, Notification, and Comms say where work came from, not what happens if you ignore it.'],
  ['No first thing.', 'Four rows, four equal buttons.'],
  ['No finish line.', 'Work disappears silently. There is no done.'],
  ['Nothing for managers.', 'They walk the floor and ask.'],
]

function Slide06() {
  return (
    <SlideFrame slideNumber={6} eyebrow={ONE_HOUR}>
      <Title>Five reasons people still feel lost</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {FIVE_REASONS.map(([bold, rest], i) => (
          <p key={i} style={{ fontSize: 26, lineHeight: '36px' }}>
            <strong style={{ fontWeight: 600 }}>{bold}</strong> <span style={{ color: 'var(--n-600)' }}>{rest}</span>
          </p>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 7: personas ----------

function PersonaCard({ name, body }: { name: string; body: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-1)', padding: 40 }}>
      <p style={{ fontSize: 26, fontWeight: 600, marginBottom: 16 }}>{name}</p>
      <p style={{ fontSize: 20, lineHeight: '30px', color: 'var(--n-600)' }}>{body}</p>
    </div>
  )
}

function Slide07() {
  return (
    <SlideFrame slideNumber={7} eyebrow={ONE_HOUR}>
      <Title>Two people, one shift</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        <PersonaCard
          name="Priya Raman. Outbound Exception Coordinator."
          body="Fixes the problems that stop orders reaching a truck. Works at a shared desk by the dock, interrupted every few minutes."
        />
        <PersonaCard
          name="Danielle Okafor. Shift Operations Manager."
          body="Seven people. Lives on the floor, checks the screen in thirty second glances."
        />
      </div>
      <p style={{ fontSize: 18, color: 'var(--n-500)' }}>
        Out of scope for now: pickers and packers. Their scanners already give them one task at a time.
      </p>
    </SlideFrame>
  )
}

// ---------- slide 8: timeline ----------

const TRUCKS_TIMELINE = [
  { time: '11:30', label: 'UPS' },
  { time: '12:15', label: 'Amazon Logistics' },
  { time: '14:00', label: 'FedEx' },
  { time: '15:30', label: 'USPS' },
]

function pct(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const mins = h * 60 + m - 6 * 60 - 30
  return (mins / (10.5 * 60)) * 100
}

function Slide08() {
  return (
    <SlideFrame slideNumber={8} eyebrow={ONE_HOUR}>
      <Title>In fulfillment, trucks set the deadlines</Title>
      <div style={{ position: 'relative', height: 4, background: 'var(--n-200)', marginTop: 100, marginBottom: 190 }}>
        <div style={{ position: 'absolute', left: 0, top: -32, fontSize: 16, color: 'var(--n-500)' }}>06:30</div>
        <div style={{ position: 'absolute', right: 0, top: -32, fontSize: 16, color: 'var(--n-500)' }}>17:00</div>
        <div style={{ position: 'absolute', left: `${pct('10:40')}%`, top: -60, transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>Now 10:40</div>
          <div style={{ width: 2, height: 24, background: 'var(--n-900)', margin: '4px auto 0' }} />
        </div>
        {TRUCKS_TIMELINE.map((t, i) => (
          <div
            key={t.time}
            style={{ position: 'absolute', left: `${pct(t.time)}%`, top: i % 2 === 0 ? 12 : 96, transform: 'translateX(-50%)', textAlign: 'center' }}
          >
            <div style={{ width: 2, height: 16, background: 'var(--now-solid)', margin: '0 auto 8px' }} />
            <Truck size={22} color="var(--now-fg)" />
            <div style={{ fontSize: 15, marginTop: 6, whiteSpace: 'nowrap' }}>
              {t.label} {t.time}
            </div>
          </div>
        ))}
      </div>
      <Caption>A truck does not wait. Missing it means a whole wave of customers gets their orders late.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 9: assumptions table ----------

const ASSUMPTIONS: { text: string; confidence: 'Assumed' | 'Needs research'; check: string }[] = [
  { text: 'The fulfillment team in the brief is desk based exception coordinators and their shift manager.', confidence: 'Assumed', check: 'Shadow two coordinators for a full shift.' },
  { text: 'Source systems can tell us the due time, the linked truck, and how many orders are blocked.', confidence: 'Assumed', check: 'Check the WMS and carrier feeds with engineering.' },
  { text: 'People mainly use a shared desktop, and read it from up to 2 meters away.', confidence: 'Assumed', check: 'Site visit and photos of workstations.' },
  { text: 'A coordinator handles 5 to 20 actionable items per shift.', confidence: 'Needs research', check: 'Pull one week of exception logs.' },
  { text: 'One shared priority model is acceptable to both workers and managers.', confidence: 'Needs research', check: 'Card sort and a ranking exercise with both groups.' },
  { text: 'Managers want to step in on exceptions, not watch people minute by minute.', confidence: 'Assumed', check: 'Manager interviews, plus a trust survey after the pilot.' },
]

function Slide09() {
  return (
    <SlideFrame slideNumber={9} eyebrow={ONE_HOUR}>
      <Title size={44}>What we assumed, and how we would check</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ASSUMPTIONS.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderTop: i > 0 ? '1px solid var(--n-200)' : undefined }}>
            <span style={{ fontSize: 18, flex: 2.2 }}>{a.text}</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 999,
                background: a.confidence === 'Assumed' ? 'var(--next-bg)' : 'var(--fyi-bg)',
                color: a.confidence === 'Assumed' ? 'var(--next-fg)' : 'var(--fyi-fg)',
                whiteSpace: 'nowrap',
              }}
            >
              {a.confidence}
            </span>
            <span style={{ fontSize: 16, color: 'var(--n-500)', flex: 1.3 }}>{a.check}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 10: principles ----------

const PRINCIPLES = [
  'One thing first.',
  'Always say why.',
  'Group by time, not by source.',
  'See the work, not the worker.',
  'Undo instead of are you sure.',
]

function Slide10() {
  return (
    <SlideFrame slideNumber={10} eyebrow={ONE_HOUR}>
      <Title>Five rules we designed by</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {PRINCIPLES.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--n-300)', width: 48 }}>{i + 1}</span>
            <span style={{ fontSize: 30, fontWeight: 500 }}>{p}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 11: three groups ----------

function Slide11() {
  const tiers: { tier: 'now' | 'next' | 'later'; label: string; helper: string }[] = [
    { tier: 'now', label: copy.tiers.now.label, helper: copy.tiers.now.helper },
    { tier: 'next', label: copy.tiers.next.label, helper: copy.tiers.next.helper },
    { tier: 'later', label: copy.tiers.later.label, helper: copy.tiers.later.helper },
  ]
  return (
    <SlideFrame slideNumber={11}>
      <Title>Every task lands in one of three groups</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 48 }}>
        {tiers.map((t) => (
          <div key={t.tier} style={{ flex: 1, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-1)', padding: 36 }}>
            <PriorityIcon tier={t.tier} size={32} />
            <p style={{ fontSize: 26, fontWeight: 600, margin: '20px 0 12px' }}>{t.label}</p>
            <p style={{ fontSize: 18, color: 'var(--n-600)' }}>{t.helper}</p>
          </div>
        ))}
      </div>
      <Caption>For your info never enters the queue. It goes to Updates.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 12: four questions ----------

const FOUR_QUESTIONS: { Icon: typeof Clock; text: string }[] = [
  { Icon: Clock, text: 'How soon is it due?' },
  { Icon: Package, text: 'How many orders are waiting on it?' },
  { Icon: UserRound, text: 'Will customers feel it?' },
  { Icon: ShieldAlert, text: 'Is it about safety or the law?' },
]

function Slide12() {
  return (
    <SlideFrame slideNumber={12}>
      <Title>Four questions decide the order</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 56 }}>
        {FOUR_QUESTIONS.map(({ Icon, text }, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Icon size={32} color="var(--n-700)" />
            <span style={{ fontSize: 22, lineHeight: '30px' }}>{text}</span>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--now-bg)', borderRadius: 16, padding: '28px 36px' }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--now-fg)' }}>
          Safety always goes first, no matter what the numbers say.
        </span>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 13: proof ----------

const OLD_WAY = [
  'Order 4821 payment mismatch (overdue since 08:40)',
  'Reply to vendor about damaged tote count (10:45)',
  'Danielle asked you to confirm the UPS order count (11:00)',
  'Label printer offline at Pack 7 (11:30)',
  'Lithium battery orders missing hazmat labels (11:45)',
  'Rush shipping request on order 4796 (tomorrow)',
]
const RELAY_WAY = [
  'Label printer offline at Pack 7 (score 62, blocks 140 orders, UPS 11:30)',
  'Lithium battery orders missing hazmat labels (61)',
  'Order 4821 payment mismatch (50)',
  'Reply to vendor about damaged tote count (36)',
  'Danielle asked you to confirm the UPS order count (36)',
  'Rush shipping request on order 4796 (12)',
]

function ProofColumn({ title, rows, highlight }: { title: string; rows: string[]; highlight: number }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--n-500)' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              fontSize: 18,
              padding: '10px 14px',
              borderRadius: 8,
              background: i === highlight ? 'var(--now-bg)' : 'transparent',
              color: i === highlight ? 'var(--now-fg)' : 'var(--n-800)',
              fontWeight: i === highlight ? 600 : 400,
            }}
          >
            {i + 1}. {r}
          </div>
        ))}
      </div>
    </div>
  )
}

function Slide13() {
  return (
    <SlideFrame slideNumber={13} eyebrow={ONE_HOUR}>
      <Title size={44}>Same six tasks, different first move</Title>
      <div style={{ display: 'flex', gap: 56, marginBottom: 32 }}>
        <ProofColumn title="Sorted by due time" rows={OLD_WAY} highlight={3} />
        <ProofColumn title="Sorted by Relay" rows={RELAY_WAY} highlight={0} />
      </div>
      <Caption>The printer is not due first, but it blocks 140 orders for the 11:30 truck. It should come first.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 14: low fi wireframe (work) ----------

const SLIDE_14_CALLOUTS = [
  'One task at the top, with the reason it is first.',
  'Three groups, named by time.',
  'A short reason on every row.',
  'Trucks and progress on the side, never competing.',
]

function Slide14() {
  return (
    <SlideFrame slideNumber={14} eyebrow={ONE_HOUR}>
      <Title size={48}>The shape of the answer</Title>
      <div style={{ display: 'flex', gap: 48, height: 640 }}>
        <div style={{ flex: 1.6 }}>
          <WorkWireframe />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 8 }}>
          {SLIDE_14_CALLOUTS.map((text, i) => (
            <Callout key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 15: my work live ----------

const SLIDE_15_CALLOUTS = [
  'Do this now, and why.',
  'Start tells the team what you are working on.',
  'Only Do now is tinted red. Color stays rare, so it keeps its meaning.',
  'The next trucks are always visible.',
]

function Slide15() {
  return (
    <SlideFrame slideNumber={15} eyebrow={EXTENSION}>
      <Title size={48}>My work</Title>
      <div style={{ display: 'flex', gap: 48 }}>
        <LiveEmbed width={1180} height={700} overrides={{ persona: 'u1' }} virtualWidth={1440} virtualHeight={860}>
          <WorkPage frozen />
        </LiveEmbed>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 8 }}>
          {SLIDE_15_CALLOUTS.map((text, i) => (
            <Callout key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 16: finishing work ----------

function Slide16() {
  return (
    <SlideFrame slideNumber={16} eyebrow={EXTENSION}>
      <Title size={48}>Finish one thing, the next one is ready</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40, alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-2)', border: '1px solid var(--n-200)', padding: 28 }}>
          <p style={{ fontSize: 16, color: 'var(--n-500)', marginBottom: 12 }}>The hero, Mark done pressed</p>
          <div style={{ background: 'var(--done-fg-strong)', color: '#fff', borderRadius: 10, padding: '14px 20px', fontSize: 18, fontWeight: 600, display: 'inline-block' }}>
            Done
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--n-900)', borderRadius: 16, padding: 28 }}>
          <p style={{ fontSize: 16, color: 'var(--n-400)', marginBottom: 12 }}>The toast</p>
          <p style={{ color: '#fff', fontSize: 18 }}>
            Done. 5 of 10 done today. <span style={{ color: 'var(--accent-on-ink)', fontWeight: 600 }}>Undo</span>
          </p>
        </div>
        <div style={{ flex: 1, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-2)', border: '1px solid var(--n-200)', padding: 28 }}>
          <p style={{ fontSize: 16, color: 'var(--n-500)', marginBottom: 12 }}>The next task in the hero</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PriorityIcon tier="now" size={20} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Lithium battery orders missing hazmat labels</span>
          </div>
        </div>
      </div>
      <Caption>No confirm dialogs. Undo is always there for eight seconds.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 17: new urgent ----------

function Slide17() {
  return (
    <SlideFrame slideNumber={17} eyebrow={EXTENSION}>
      <Title size={48}>Urgent work never jumps under your cursor</Title>
      <div style={{ maxWidth: 1100, background: 'var(--n-0)', borderRadius: 16, boxShadow: 'var(--e-2)', border: '1px solid var(--now-border)', padding: 0, marginBottom: 40 }}>
        <div style={{ background: 'var(--now-bg)', color: 'var(--now-fg)', padding: '18px 28px', borderRadius: '16px 16px 0 0', fontSize: 18, display: 'flex', justifyContent: 'space-between' }}>
          <span>New and more urgent: Conveyor stopped at Pack 9 merge.</span>
          <span style={{ display: 'flex', gap: 16, fontWeight: 600 }}>
            <span>Show me</span>
            <span style={{ color: 'var(--n-500)' }}>Stay here</span>
          </span>
        </div>
        <div style={{ padding: 28 }}>
          <p style={{ fontSize: 22, fontWeight: 600 }}>Label printer offline at Pack 7</p>
        </div>
      </div>
      <Caption>If you are busy, we tell you and let you choose. If you are away, we move it to the top for you.</Caption>
    </SlideFrame>
  )
}

// ---------- slide 18: low fi wireframe (team) ----------

const SLIDE_18_CALLOUTS = [
  'Four numbers that matter right now.',
  'What each person is working on.',
  'What needs the manager, with one button each.',
]

function Slide18() {
  return (
    <SlideFrame slideNumber={18} eyebrow={EXTENSION}>
      <Title size={48}>The manager's view, in shape</Title>
      <div style={{ display: 'flex', gap: 48, height: 640 }}>
        <div style={{ flex: 1.6 }}>
          <TeamWireframe />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 8 }}>
          {SLIDE_18_CALLOUTS.map((text, i) => (
            <Callout key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 19: team live ----------

const SLIDE_19_CALLOUTS = [
  'Kwame is out, and two tasks have no owner.',
  'Tomasz’s escalation has had no update for 80 minutes. It is flagged as may need help.',
  'Assign in two clicks, with undo.',
  'Each person’s load in words: light, busy, or full.',
]

function Slide19() {
  return (
    <SlideFrame slideNumber={19} eyebrow={EXTENSION}>
      <Title size={48}>Team</Title>
      <div style={{ display: 'flex', gap: 48 }}>
        <LiveEmbed width={1180} height={700} overrides={{ persona: 'm1' }} virtualWidth={1440} virtualHeight={860}>
          <TeamPage frozen />
        </LiveEmbed>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 8 }}>
          {SLIDE_19_CALLOUTS.map((text, i) => (
            <Callout key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 20: see the work ----------

const WE_SHOW = ['What each person is working on', 'Work that is late or has no owner', 'Tasks that may need help', 'Trucks at risk']
const WE_NEVER = ['Idle time or time off task', 'Keystrokes or screen activity', 'Rankings of people', 'Break timers']

function Slide20() {
  return (
    <SlideFrame slideNumber={20} eyebrow={EXTENSION}>
      <Title size={44}>What managers see, and what they never see</Title>
      <div style={{ display: 'flex', gap: 48, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--done-fg)', marginBottom: 16 }}>We show</p>
          {WE_SHOW.map((t) => (
            <p key={t} style={{ fontSize: 22, padding: '10px 0', borderTop: '1px solid var(--n-200)' }}>
              {t}
            </p>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--now-fg)', marginBottom: 16 }}>We never show</p>
          {WE_NEVER.map((t) => (
            <p key={t} style={{ fontSize: 22, padding: '10px 0', borderTop: '1px solid var(--n-200)' }}>
              {t}
            </p>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--n-100)', borderRadius: 16, padding: '24px 32px' }}>
        <span style={{ fontSize: 20, fontWeight: 500 }}>Everyone sees the same team board. Nothing about people is hidden from them.</span>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 21: where did panels go ----------

const PANEL_HOMES: [string, string][] = [
  ['Tasks (Orders)', 'Ranked into My work. Source tag Order.'],
  ['Notifications', 'Ranked into My work when they need action. Otherwise in Updates.'],
  ['Team updates (Internal Comms)', 'Ranked into My work when someone asks you something. Otherwise in Updates.'],
  ['Recent activity', 'Updates, under Activity. Never ranked.'],
]

function Slide21() {
  return (
    <SlideFrame slideNumber={21} eyebrow={EXTENSION}>
      <Title size={48}>Nothing was removed. It was sorted.</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {PANEL_HOMES.map(([from, to], i) => (
          <div key={from} style={{ display: 'flex', gap: 40, padding: '20px 0', borderTop: i > 0 ? '1px solid var(--n-200)' : undefined }}>
            <span style={{ fontSize: 22, fontWeight: 600, flex: 1 }}>{from}</span>
            <span style={{ fontSize: 20, color: 'var(--n-600)', flex: 1.6 }}>{to}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 22: tradeoffs ----------

const TRADEOFFS: [string, string][] = [
  ['Three simple groups', 'Fine grained ranking of every item'],
  ['A rule we can explain in one sentence', 'The extra accuracy of machine learning, for now'],
  ['One big task at the top', 'Seeing more rows without scrolling'],
  ['Work visibility for managers', 'Minute by minute tracking of people'],
  ['A Start button', 'One extra click per task'],
]

function Slide22() {
  return (
    <SlideFrame slideNumber={22} eyebrow={EXTENSION}>
      <Title size={44}>What we chose, and what we gave up</Title>
      <div style={{ display: 'flex', gap: 48, marginBottom: 28 }}>
        <p style={{ flex: 1, fontSize: 18, fontWeight: 600, color: 'var(--done-fg)' }}>We chose</p>
        <p style={{ flex: 1, fontSize: 18, fontWeight: 600, color: 'var(--n-500)' }}>We gave up</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
        {TRADEOFFS.map(([chose, gave], i) => (
          <div key={i} style={{ display: 'flex', gap: 48, padding: '12px 0', borderTop: i > 0 ? '1px solid var(--n-200)' : undefined }}>
            <span style={{ fontSize: 19, flex: 1 }}>{chose}</span>
            <span style={{ fontSize: 19, color: 'var(--n-500)', flex: 1 }}>{gave}</span>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--n-100)', borderRadius: 16, padding: '22px 32px' }}>
        <span style={{ fontSize: 19, fontWeight: 500 }}>Why it is worth it: people act faster on a list they understand and trust.</span>
      </div>
    </SlideFrame>
  )
}

// ---------- slide 23: risks ----------

const RISKS: [string, string][] = [
  ['Everything becomes Do now.', 'High thresholds. We flag anyone with more than three Do now tasks so the manager can rebalance.'],
  ['People game the ranking.', 'Only set roles can escalate. Waiting needs a person and a time. Managers see overrides.'],
  ['People stop trusting it.', 'Every rank has a reason. People can ask for help, say not mine, or hand off, and we review those signals weekly.'],
  ['Data goes stale.', 'An updated time is always visible, with a warning when a feed is late.'],
]

function Slide23() {
  return (
    <SlideFrame slideNumber={23} eyebrow={EXTENSION}>
      <Title size={48}>What could go wrong</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {RISKS.map(([risk, answer], i) => (
          <div key={i} style={{ display: 'flex', gap: 40, padding: '18px 0', borderTop: i > 0 ? '1px solid var(--n-200)' : undefined }}>
            <span style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>{risk}</span>
            <span style={{ fontSize: 19, color: 'var(--n-600)', flex: 1.8 }}>{answer}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 24: pilot metrics ----------

const METRICS: [string, string][] = [
  ['5 min', 'Under 5 min to first action on Do now tasks'],
  ['fewer', 'Fewer orders missing their truck because of an exception'],
  ['10 min', 'Under 10 min for work with no owner to find one'],
  ['10 s', 'Under 10 s for a manager to say what is at risk'],
]

function Slide24() {
  return (
    <SlideFrame slideNumber={24} eyebrow={EXTENSION}>
      <Title size={44}>A four week pilot on one shift</Title>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        {METRICS.map(([num, label], i) => (
          <div key={i} style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 600 }}>{num}</p>
            <p style={{ fontSize: 18, color: 'var(--n-600)', marginTop: 8 }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 20, color: 'var(--n-600)' }}>
        Plus a short trust survey: do I understand why tasks are ranked, and do I feel watched?
      </p>
    </SlideFrame>
  )
}

// ---------- slide 25: design system ----------

const NEUTRAL_SWATCHES = ['--n-0', '--n-75', '--n-200', '--n-400', '--n-600', '--n-900']
const TIER_SWATCHES: ('now' | 'next' | 'later' | 'done' | 'fyi')[] = ['now', 'next', 'later', 'done', 'fyi']

function Slide25() {
  return (
    <SlideFrame slideNumber={25}>
      <Title size={44}>A small system, built to stay calm</Title>
      <div style={{ display: 'flex', gap: 56 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, color: 'var(--n-500)', marginBottom: 12 }}>Color</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {NEUTRAL_SWATCHES.map((t) => (
              <div key={t} style={{ width: 40, height: 40, borderRadius: 8, background: `var(${t})`, border: '1px solid var(--n-200)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TIER_SWATCHES.map((tier) => (
              <PriorityIcon key={tier} tier={tier} size={28} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, color: 'var(--n-500)', marginBottom: 12 }}>Type</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>Page title</p>
          <p style={{ fontSize: 20, fontWeight: 500 }}>Row title</p>
          <p style={{ fontSize: 16, color: 'var(--n-600)' }}>Body text</p>
        </div>
        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 16, color: 'var(--n-500)', marginBottom: 4 }}>Components</p>
          <Chip tone="now">Do now</Chip>
          <div style={{ background: 'var(--n-0)', boxShadow: 'var(--e-1)', borderRadius: 10, padding: 14, fontSize: 16 }}>Priority row</div>
          <div style={{ background: 'var(--n-900)', color: '#fff', borderRadius: 10, padding: 14, fontSize: 16 }}>Toast</div>
        </div>
      </div>
      <p style={{ fontSize: 18, color: 'var(--n-600)', marginTop: 32 }}>Every color has a job. Red appears only where something is truly at risk.</p>
    </SlideFrame>
  )
}

// ---------- slide 26: what's next ----------

const WHATS_NEXT = [
  'Shift handoff that writes itself, so nothing is lost at 17:00.',
  'A handheld version for Problem Solve leads on the floor.',
  'Pinning, once we know how people want to override the order.',
  'Learning from overrides to tune the ranking every week.',
]

function Slide26() {
  return (
    <SlideFrame slideNumber={26}>
      <Title>What we would build next</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {WHATS_NEXT.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--n-300)', width: 48 }}>{i + 1}</span>
            <span style={{ fontSize: 26 }}>{text}</span>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

// ---------- slide 27: try it ----------

const PROD_URL = 'https://foundey-relay.vercel.app'

function Slide27() {
  const [qr, setQr] = useState('')
  useEffect(() => {
    QRCode.toDataURL(PROD_URL, { margin: 1, width: 320 }).then(setQr)
  }, [])
  return (
    <SlideFrame slideNumber={27}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Title size={56}>Try it yourself</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
              {PROD_URL.replace('https://', '')}
            </p>
            <p style={{ fontSize: 18, color: 'var(--n-600)', marginBottom: 8 }}>
              Tip: open Prototype controls to switch between Priya and Danielle, send an urgent task, or see it in wireframe mode.
            </p>
            <p style={{ fontSize: 18, color: 'var(--n-600)' }}>Design system: {PROD_URL.replace('https://', '')}/system</p>
          </div>
          {qr && <img src={qr} width={220} height={220} alt="QR code to the prototype" style={{ borderRadius: 12 }} />}
        </div>
      </div>
    </SlideFrame>
  )
}

// ---------- assembly ----------

export interface SlideDef {
  number: number
  Component: () => ReactNode
  notes: string
}

export const SLIDES: SlideDef[] = [
  { number: 1, Component: Slide01, notes: "This is a redesign of an internal fulfillment dashboard. I'll give the short answer first, then show how far I took it." },
  { number: 2, Component: Slide02, notes: 'Everything after this slide supports these three sentences.' },
  { number: 3, Component: Slide03, notes: 'Notice the second quote. The challenge sentence only mentions the first. I treated both as the brief.' },
  { number: 4, Component: Slide04, notes: 'This was the surprise. The obvious answer is already on screen, and people still feel lost. So the problem is deeper than sorting.' },
  { number: 5, Component: Slide05, notes: 'Dashboards full of equal widgets are the usual answer. They show everything and decide nothing. See the Wrike and ClickUp references in the research.' },
  { number: 6, Component: Slide06, notes: 'Each of these maps to one design decision later in the deck.' },
  { number: 7, Component: Slide07, notes: 'The examples in the brief, like payment mismatches and compliance filings, are desk work. So I designed for the desk first.' },
  { number: 8, Component: Slide08, notes: 'This is the missing input in the old ranking. Due dates are personal. Truck cutoffs are shared and hard.' },
  { number: 9, Component: Slide09, notes: 'None of these are validated yet. The pilot on slide 24 is designed to test them. I also found no real warehouse apps in public pattern libraries, so the fulfillment details come from industry knowledge, not precedent.' },
  { number: 10, Component: Slide10, notes: 'When the team disagreed, we came back to these.' },
  { number: 11, Component: Slide11, notes: 'Named by time because workers think in when, not in severity words like critical or high.' },
  { number: 12, Component: Slide12, notes: 'The formula is simple points, and we can explain it in one sentence. That matters more than being clever. Machine learning can come later, once we have data on when people disagree with the ranking.' },
  { number: 13, Component: Slide13, notes: 'This is the heart of the design. A small late task should not beat a big blocker that is about to miss a truck.' },
  { number: 14, Component: Slide14, notes: 'This is the deliverable the brief asked for. Everything after this is extension.' },
  { number: 15, Component: Slide15, notes: 'Paper and ink. Calm by default. Color only where the ranking says so.' },
  { number: 16, Component: Slide16, notes: 'Closure was missing. People need to feel progress during a ten hour shift.' },
  { number: 17, Component: Slide17, notes: 'Lists that reorder while you click cause mistakes. This protects the thing you are about to press.' },
  { number: 18, Component: Slide18, notes: 'Same priority model, same groups, seen from above.' },
  { number: 19, Component: Slide19, notes: 'This answers the manager complaint in a way that helps rather than polices.' },
  { number: 20, Component: Slide20, notes: 'Warehouse monitoring has faced real public criticism, and several US states now regulate quotas. A dashboard that times people would be risky, and people would game it. Flags attach to tasks, not to people.' },
  { number: 21, Component: Slide21, notes: 'A common worry in redesigns. Every old panel has a clear new home.' },
  { number: 22, Component: Slide22, notes: 'The Start click is the most debatable. Without it, the manager view would be guessing.' },
  { number: 23, Component: Slide23, notes: 'Overrides are also our best data. If people often push a type of task down, the model is wrong about it.' },
  { number: 24, Component: Slide24, notes: 'Run against a control shift at the same site.' },
  { number: 25, Component: Slide25, notes: 'Every color has a job. Red appears only where something is truly at risk.' },
  { number: 26, Component: Slide26, notes: "The handoff one is backed by the data. The printer was flagged at night handoff and nobody acted until it blocked 140 orders." },
  { number: 27, Component: Slide27, notes: 'Thank you.' },
]
