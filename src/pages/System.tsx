import { useEffect, useState } from 'react'
import { Wordmark } from '../components/Wordmark'
import { PriorityIcon } from '../components/PriorityIcon'
import { TimePill } from '../components/TimePill'
import { SourceTag } from '../components/SourceTag'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Avatar } from '../components/Avatar'
import { Kbd } from '../components/Kbd'
import { LoadLabel } from '../components/LoadLabel'
import { TierHeader } from '../components/TierHeader'
import { PriorityRow } from '../components/PriorityRow'
import { HeroCard } from '../components/HeroCard'
import { Segmented } from '../components/Segmented'
import { EmptyState } from '../components/EmptyState'
import { RiskTile } from '../components/RiskTile'
import { useStore } from '../state/store'
import { items, team } from '../data/seed'
import { scoreItem, rankItems, loadFor } from '../lib/priority'
import { copy } from '../copy'
import type { Tier } from '../lib/types'

const NOW = new Date('2026-09-22T10:40:00-07:00')

const NEUTRAL_TOKENS = ['--n-0', '--n-25', '--n-50', '--n-75', '--n-100', '--n-200', '--n-300', '--n-400', '--n-500', '--n-600', '--n-800', '--n-900']

/** Reads each token's actual value straight from the cascade, so the doc can never drift from tokens.css (R3: no raw hex in components). */
function useTokenValues(tokens: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    const style = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    for (const token of tokens) next[token] = style.getPropertyValue(token).trim()
    setValues(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return values
}
const TIER_SWATCHES: { tier: Tier; fg: string; bg: string }[] = [
  { tier: 'now', fg: '--now-fg', bg: '--now-bg' },
  { tier: 'next', fg: '--next-fg', bg: '--next-bg' },
  { tier: 'later', fg: '--later-fg', bg: '--later-bg' },
  { tier: 'done', fg: '--done-fg', bg: '--done-bg' },
  { tier: 'fyi', fg: '--fyi-fg', bg: '--fyi-bg' },
]
const TYPE_SPECIMENS = [
  { role: 'page-title', size: '24/32', weight: 600, className: 'text-[24px] leading-[32px] font-semibold tracking-[-0.015em]' },
  { role: 'hero-title', size: '22/30', weight: 600, className: 'text-[22px] leading-[30px] font-semibold tracking-[-0.01em]' },
  { role: 'stat-number', size: '28/32', weight: 600, className: 'text-[28px] leading-[32px] font-semibold tracking-[-0.02em] tnum' },
  { role: 'section', size: '15/22', weight: 600, className: 'text-[15px] leading-[22px] font-semibold tracking-[-0.005em]' },
  { role: 'row-title', size: '15/22', weight: 500, className: 'text-[15px] leading-[22px] font-medium' },
  { role: 'body', size: '14/20', weight: 400, className: 'text-[14px] leading-[20px] font-normal' },
  { role: 'meta', size: '13/18', weight: 400, className: 'text-[13px] leading-[18px] font-normal' },
  { role: 'eyebrow', size: '12/16', weight: 600, className: 'text-[12px] leading-[16px] font-semibold tracking-[0.06em] uppercase' },
]
const SPACING = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [`--s-${n}`, `var(--s-${n})`] as const)
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', 'full'].map((r) => [`--r-${r}`, `var(--r-${r})`] as const)
const ELEVATIONS: { key: string; className: string }[] = [
  { key: 'e-1', className: 'shadow-e1' },
  { key: 'e-2', className: 'shadow-e2' },
  { key: 'e-3', className: 'shadow-e3' },
  { key: 'e-4', className: 'shadow-e4' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <h2 className="text-[20px] font-semibold text-n-900 mb-5 pb-2 border-b border-n-100">{title}</h2>
      {children}
    </section>
  )
}

const NAV = [
  ['principles', 'Principles'], ['color', 'Color'], ['type', 'Type'], ['spacing', 'Spacing'], ['radius', 'Radius'],
  ['elevation', 'Elevation'], ['motion', 'Motion'], ['icons', 'Iconography'], ['components', 'Components'],
  ['priority-model', 'Priority model'], ['voice', 'Voice and copy'], ['a11y', 'Accessibility'],
]

const PRINCIPLES = [
  'One thing first.', 'Always say why.', 'Group by time, not by source.', 'See the work, not the worker.', 'Undo instead of are you sure.',
]

export default function SystemPage() {
  const { state, dispatch } = useStore()
  const exampleItem = items.find((i) => i.id === 'it-01')!
  const exampleResult = scoreItem(exampleItem, NOW)
  const ranked = rankItems(items.filter((i) => i.assigneeId === 'u1'), NOW)
  const [motionKey, setMotionKey] = useState(0)
  const neutralValues = useTokenValues(NEUTRAL_TOKENS)

  return (
    <div className="min-h-screen bg-n-50 flex">
      <nav className="w-[220px] shrink-0 border-r border-n-100 p-6 sticky top-0 h-screen overflow-y-auto">
        <Wordmark />
        <p className="text-[12px] text-n-500 mt-2 mb-6">Design system</p>
        <ul className="flex flex-col gap-1">
          {NAV.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block text-[13px] text-n-600 hover:text-n-900 py-1">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-n-500 mt-8 mb-2 uppercase tracking-[0.06em]">Figma</p>
        <ul className="flex flex-col gap-1">
          <li>
            <a href="https://www.figma.com/design/6LcEBYGmZ5g2ClZEZL1sVW/foundey" target="_blank" rel="noreferrer" className="block text-[13px] text-accent hover:underline py-1">
              Design system
            </a>
          </li>
          <li>
            <a href="https://www.figma.com/design/kCzpf4SUDbgCiTETVLHUKB" target="_blank" rel="noreferrer" className="block text-[13px] text-accent hover:underline py-1">
              Prototype
            </a>
          </li>
          <li>
            <a href="https://www.figma.com/slides/kg9EEVz7cQ1d8z62HMgokd" target="_blank" rel="noreferrer" className="block text-[13px] text-accent hover:underline py-1">
              Deck
            </a>
          </li>
        </ul>
      </nav>

      <main className="flex-1 max-w-[900px] px-10 py-10">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-n-900 mb-1">Relay design system</h1>
            <p className="text-[14px] text-n-600">Paper and ink. Color is reserved for priority and status.</p>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-n-600">
            <input type="checkbox" checked={state.wireframe} onChange={() => dispatch({ type: 'TOGGLE_WIREFRAME' })} />
            {copy.demo.wireframe}
          </label>
        </header>

        <Section id="principles" title="Principles">
          <ol className="flex flex-col gap-2">
            {PRINCIPLES.map((p, i) => (
              <li key={p} className="flex items-baseline gap-3 text-[15px] text-n-900">
                <span className="tnum text-n-400 font-semibold w-5">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="color" title="Color">
          <h3 className="text-[13px] font-semibold text-n-500 mb-2 uppercase tracking-[0.06em]">Neutrals</h3>
          <div className="grid grid-cols-6 gap-3 mb-8">
            {NEUTRAL_TOKENS.map((token) => (
              <div key={token}>
                <div className="h-14 rounded-md border border-n-100" style={{ background: `var(${token})` }} />
                <div className="text-[11px] text-n-500 mt-1 tnum">{token}</div>
                <div className="text-[11px] text-n-400 tnum">{neutralValues[token] ?? ''}</div>
              </div>
            ))}
          </div>
          <h3 className="text-[13px] font-semibold text-n-500 mb-2 uppercase tracking-[0.06em]">Tiers (reserved for priority and status)</h3>
          <div className="grid grid-cols-5 gap-3">
            {TIER_SWATCHES.map((t) => (
              <div key={t.tier} className="rounded-md border border-n-100 p-3" style={{ background: `var(${t.bg})` }}>
                <PriorityIcon tier={t.tier} size={20} />
                <div className="text-[13px] font-medium mt-2" style={{ color: `var(${t.fg})` }}>
                  {t.tier}
                </div>
                <div className="text-[11px] text-n-500 mt-1">AA on white and on this tint</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Type">
          <div className="flex flex-col gap-4">
            {TYPE_SPECIMENS.map((s) => (
              <div key={s.role} className="flex items-baseline gap-4">
                <span className="w-28 text-[12px] text-n-500 tnum shrink-0">
                  {s.role} · {s.size} · {s.weight}
                </span>
                <span className={`${s.className} text-n-900`}>Blocks 140 orders for UPS 11:30</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="spacing" title="Spacing">
          <div className="flex items-end gap-3 flex-wrap">
            {SPACING.map(([token, val]) => (
              <div key={token} className="text-center">
                <div className="bg-accent" style={{ width: val, height: val }} />
                <div className="text-[11px] text-n-500 mt-1 tnum">{token}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="radius" title="Radius">
          <div className="flex items-end gap-4">
            {RADII.map(([token, val]) => (
              <div key={token} className="text-center">
                <div className="w-16 h-16 bg-n-100 border border-n-200" style={{ borderRadius: val }} />
                <div className="text-[11px] text-n-500 mt-1 tnum">{token}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="elevation" title="Elevation">
          <div className="flex items-end gap-6">
            {ELEVATIONS.map((e) => (
              <div key={e.key} className="text-center">
                <div className={`w-20 h-20 bg-n-0 rounded-lg ${e.className}`} />
                <div className="text-[11px] text-n-500 mt-2 tnum">{e.key}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="motion" title="Motion">
          <p className="text-[13px] text-n-500 mb-3">Plays the done sequence: press, crossfade, pop, then the row promotes into the hero.</p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setMotionKey((k) => k + 1)}
            className="motion-safe:active:scale-95"
          >
            {copy.actions.done}
          </Button>
          <span key={motionKey} className="inline-flex items-center gap-1.5 ml-3 text-[13px] text-done-fg motion-safe:animate-[pulse_0.6s_ease-out]">
            <PriorityIcon tier="done" size={16} /> Done. 5 of 10 done today.
          </span>
        </Section>

        <Section id="icons" title="Iconography">
          <div className="grid grid-cols-5 gap-4">
            {(['now', 'next', 'later', 'done', 'fyi'] as Tier[]).map((tier) => (
              <div key={tier} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-n-100">
                <PriorityIcon tier={tier} size={24} />
                <span className="text-[13px] text-n-900">{tier === 'done' ? copy.tiers.done.label : copy.tiers[tier].label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="components" title="Components">
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">Button</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="primary" size="lg">Primary lg</Button>
                <Button variant="secondary" size="md">Secondary md</Button>
                <Button variant="ghost" size="sm">Ghost sm</Button>
                <Button variant="primary" size="md" disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">Chip, Avatar, Kbd, Load</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Chip tone="now">Do now</Chip>
                <Chip tone="next">Help asked</Chip>
                <Chip tone="accent">Working on it</Chip>
                <Chip tone="done">Done</Chip>
                <Avatar initials="PR" size={32} status="working" />
                <Avatar initials="AB" size={32} status="on_break" />
                <Avatar initials="KA" size={32} status="out" />
                <Kbd>J</Kbd>
                <Kbd>Enter</Kbd>
                <LoadLabel load={loadFor(2, 3)} />
                <LoadLabel load={loadFor(0, 1)} />
                <LoadLabel load={loadFor(4, 0)} />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">TimePill, SourceTag</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <TimePill dueAt="2026-09-22T08:40:00-07:00" now={NOW} tier="now" />
                <TimePill dueAt="2026-09-22T11:00:00-07:00" now={NOW} tier="next" />
                <TimePill dueAt="2026-09-22T15:30:00-07:00" now={NOW} tier="later" size="lg" />
                <TimePill dueAt="2026-09-23T09:00:00-07:00" now={NOW} tier="later" />
                <SourceTag source="order" />
                <SourceTag source="safety" />
                <SourceTag source="carrier" />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">Segmented, RiskTile</h3>
              <div className="flex items-center gap-4">
                <Segmented options={[{ value: 'a', label: 'Priya' }, { value: 'b', label: 'Danielle' }]} value="a" onChange={() => {}} />
                <RiskTile label="Do now across team" value={4} sub="3 due by 11:30" tone="now" />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">TierHeader, PriorityRow, EmptyState</h3>
              <div className="rounded-lg shadow-e1 overflow-hidden max-w-[600px]">
                <TierHeader tier="now" count={1} />
                <ul>
                  {ranked.slice(0, 2).map((r) => (
                    <PriorityRow key={r.item.id} item={r.item} now={NOW} tier={r.result.tier} onOpen={() => {}} onStart={() => {}} onDone={() => {}} />
                  ))}
                </ul>
                <TierHeader tier="fyi" count={0} />
                <EmptyState>{copy.tiers.empty}</EmptyState>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-n-500 mb-3 uppercase tracking-[0.06em]">HeroCard</h3>
              <HeroCard ranked={{ item: exampleItem, result: exampleResult }} now={NOW} position={1} total={ranked.length} workingMinutes={16} />
            </div>
          </div>
        </Section>

        <Section id="priority-model" title="Priority model">
          <table className="w-full text-[13px] border-collapse mb-4">
            <thead>
              <tr className="text-left text-n-500 border-b border-n-100">
                <th className="py-2 pr-4">Tier</th>
                <th className="py-2 pr-4">Rule</th>
                <th className="py-2">Helper</th>
              </tr>
            </thead>
            <tbody>
              {(['now', 'next', 'later', 'fyi'] as const).map((tier) => (
                <tr key={tier} className="border-b border-n-100">
                  <td className="py-2 pr-4 font-medium text-n-900">{copy.tiers[tier].label}</td>
                  <td className="py-2 pr-4 text-n-600 tnum">
                    {tier === 'now' ? 'safety OR score >= 60' : tier === 'next' ? '30 <= score < 60' : tier === 'later' ? 'score < 30' : 'source == fyi'}
                  </td>
                  <td className="py-2 text-n-500">{copy.tiers[tier].helper}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <pre className="bg-n-25 rounded-lg p-4 text-[12px] text-n-600 overflow-x-auto tnum">
{`score = min(100, T + B + I)
T: time pressure (overdue 40, <=30min 36, <=60min 30, <=120min 22, <=240min 14, else 8)
B: orders blocked (0, 1..9 -> 6, 10..49 -> 14, 50..199 -> 22, 200+ -> 30)
I: impact (customer high +10 / low +4, compliance +15, escalated +12, safety +50)`}
          </pre>
        </Section>

        <Section id="voice" title="Voice and copy rules">
          <ul className="flex flex-col gap-2 text-[14px] text-n-700">
            <li>No dashes in user facing copy. Use periods and commas instead.</li>
            <li>Plain English, grade 6 reading level, sentences of 12 words or fewer.</li>
            <li>Buttons start with a verb: Start, Ask for help, Assign, Check in, Reassign.</li>
            <li>All UI copy lives in src/copy.ts. Never inline strings in a component.</li>
          </ul>
        </Section>

        <Section id="a11y" title="Accessibility checklist">
          <ul className="flex flex-col gap-2 text-[14px] text-n-700">
            <li>Tier headers are h2. The queue is a ul of li.</li>
            <li>The cause line is part of the row's accessible name.</li>
            <li>The full done flow works with the keyboard only (Tab, J, K, E, Z).</li>
            <li>The toast uses role="status". The new urgent live region is polite.</li>
            <li>Reduced motion is honored throughout.</li>
            <li>Text contrast is AA or better, using the token pairs as given.</li>
          </ul>
        </Section>
      </main>
    </div>
  )
}
