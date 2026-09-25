import { Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { Kbd } from "@/components/ui/kbd";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionBand } from "@/components/ui/section-band";
import { TierIcon } from "@/components/relay/tier-icon";
import { StatesMatrix } from "./states-matrix";
import { MeasuredRow } from "./measured-row";
import { AnatomySection, ComponentIndex, GlyphMatrix } from "./components-extra";
import { ModePanel } from "./kit";

const buttonStates = [
  { key: "default", label: "Default" },
  { key: "hover", label: "Hover" },
  { key: "active", label: "Active" },
  { key: "focus", label: "Focus visible" },
  { key: "disabled", label: "Disabled" },
  { key: "loading", label: "Loading" },
];

const fieldStates = [
  { key: "default", label: "Default" },
  { key: "hover", label: "Hover" },
  { key: "focus", label: "Focus visible" },
  { key: "disabled", label: "Disabled" },
];

function forceProps(state: string) {
  return {
    forceState:
      state === "hover" || state === "active" || state === "focus"
        ? (state as "hover" | "active" | "focus")
        : undefined,
    disabled: state === "disabled",
  };
}

const CONTROL_STEPS = [
  { size: "xs", height: "28", radius: "8", where: "Chips, time pills, controls inside a row's meta cluster" },
  { size: "sm", height: "32", radius: "8", where: "Secondary actions inside dense surfaces" },
  { size: "md", height: "40", radius: "10", where: "The default: inputs, selects, most buttons" },
  { size: "lg", height: "48", radius: "12", where: "The primary action" },
] as const;

export function ComponentsPage() {
  return (
    <div data-fidelity="hi" className="flex max-w-5xl flex-col gap-20">
      <header>
        <h1 className="t-section text-(--text-1)">Components</h1>
        <p data-prose-num className="t-body mt-3 max-w-[68ch] text-(--text-2)">
          Every primitive in <code className="t-mono">components/ui</code>, drawn from one size
          contract in <code className="t-mono">components/ui/sizing.ts</code>. Hover, active and
          focus are forced here through a <code className="t-mono">forceState</code> prop that
          exists only for this page — app code never sets it.
        </p>
      </header>

      <ComponentIndex />

      <section aria-labelledby="contract-heading" className="flex flex-col gap-4">
        <h2 id="contract-heading" className="t-section text-(--text-1)">
          The size contract
        </h2>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Four heights, and height decides everything else:{" "}
          <strong className="font-semibold text-(--text-1)">radius is a function of height</strong>{" "}
          (<code className="t-mono">r = round(h × 0.28)</code>), as is the icon size and the
          horizontal padding. Anything sharing a row shares one entry — no 32 beside 40, ever.
        </p>

        <div className="overflow-hidden rounded-(--r-4) border border-(--line-1)">
          <table className="w-full border-collapse">
            <caption className="sr-only">Control sizes, their radius, and what each is for</caption>
            <thead>
              <tr className="bg-(--surface-2)">
                <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                  Step
                </th>
                <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                  Height
                </th>
                <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                  Radius
                </th>
                <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                  Where
                </th>
              </tr>
            </thead>
            <tbody>
              {CONTROL_STEPS.map((step) => (
                <tr key={step.size} className="border-t border-(--line-1) bg-(--surface-1)">
                  <th scope="row" className="t-mono px-4 py-3 text-left text-(--text-1)">
                    {step.size}
                  </th>
                  <td className="t-mono px-4 py-3 text-(--text-2)">{step.height}</td>
                  <td className="t-mono px-4 py-3 text-(--text-2)">{step.radius}</td>
                  <td className="t-meta px-4 py-3 text-(--text-2)">{step.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} data-testid={`contract-row-${size}`} data-craft-row>
            <MeasuredRow label={size}>
              <Button size={size}>Reroute orders</Button>
              <Input size={size} placeholder="Order number" className="w-40" aria-label="Order number" />
              <Select size={size} defaultValue="ups" wrapperClassName="w-32" aria-label="Carrier">
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
              </Select>
              <IconButton size={size} aria-label="Add">
                <Plus aria-hidden />
              </IconButton>
            </MeasuredRow>
          </div>
        ))}
      </section>

      <section aria-labelledby="button-heading" className="flex flex-col gap-4">
        <h2 id="button-heading" className="t-section text-(--text-1)">
          Button
        </h2>
        <p className="t-body max-w-[68ch] text-(--text-2)">
          The primary button is filled with <code className="t-mono">--text-1</code>, not the
          accent. The accent is a focus ring and a link, and nothing else — a saturated fill inside
          a tinted card makes the button louder than the tier it sits in, which is the one thing
          this product&rsquo;s ranking cannot survive.
        </p>
        <StatesMatrix
          caption="Button variant"
          rows={[
            { key: "primary", label: "Primary" },
            { key: "secondary", label: "Secondary" },
            { key: "ghost", label: "Ghost" },
          ]}
          columns={buttonStates}
          render={(variant, state) => {
            const { forceState, disabled } = forceProps(state);
            return (
              <Button
                variant={variant as "primary" | "secondary" | "ghost"}
                size="md"
                forceState={forceState}
                disabled={disabled}
                loading={state === "loading"}
              >
                Mark done
              </Button>
            );
          }}
        />
      </section>

      <section aria-labelledby="icon-button-heading" className="flex flex-col gap-4">
        <h2 id="icon-button-heading" className="t-section text-(--text-1)">
          Icon button
        </h2>
        <StatesMatrix
          caption="Icon button variant"
          rows={[
            { key: "ghost", label: "Ghost" },
            { key: "secondary", label: "Secondary" },
          ]}
          columns={buttonStates.filter((s) => s.key !== "loading")}
          render={(variant, state) => {
            const { forceState, disabled } = forceProps(state);
            return (
              <IconButton
                variant={variant as "ghost" | "secondary"}
                forceState={forceState}
                disabled={disabled}
                aria-label="Delete item"
              >
                <Trash2 aria-hidden />
              </IconButton>
            );
          }}
        />
      </section>

      <section aria-labelledby="input-heading" className="flex flex-col gap-4">
        <h2 id="input-heading" className="t-section text-(--text-1)">
          Input and select
        </h2>
        <StatesMatrix
          caption="Input"
          rows={[{ key: "text", label: "Text" }]}
          columns={[...fieldStates, { key: "error", label: "Error" }]}
          render={(_row, state) => {
            const { forceState, disabled } = forceProps(state === "error" ? "default" : state);
            return (
              <Input
                forceState={forceState as "hover" | "focus" | undefined}
                disabled={disabled}
                invalid={state === "error"}
                defaultValue={state === "error" ? "abc" : ""}
                placeholder="Order number"
                aria-label="Order number"
              />
            );
          }}
        />
        <StatesMatrix
          caption="Select"
          rows={[{ key: "carrier", label: "Carrier" }]}
          columns={fieldStates}
          render={(_row, state) => {
            const { forceState, disabled } = forceProps(state);
            return (
              <Select
                forceState={forceState as "hover" | "focus" | undefined}
                disabled={disabled}
                defaultValue="ups"
                aria-label="Carrier"
              >
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
              </Select>
            );
          }}
        />
        <div className="flex max-w-xs flex-col gap-1.5 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4">
          <Label htmlFor="system-demo-carrier">Carrier</Label>
          <Select id="system-demo-carrier" defaultValue="ups">
            <option value="ups">UPS</option>
            <option value="fedex">FedEx</option>
          </Select>
        </div>
      </section>

      <section aria-labelledby="chip-heading" className="flex flex-col gap-4">
        <h2 id="chip-heading" className="t-section text-(--text-1)">
          Chip, time pill, tier icon
        </h2>
        <p className="t-body max-w-[68ch] text-(--text-2)">
          A chip carries a tier&rsquo;s text and border, never a saturated fill. Shape carries the
          tier too — filled octagon, filled triangle, hollow circle, hollow square — so the ranking
          survives having the hue taken out.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4">
          <Chip tier="now">
            <TierIcon tier="now" className="icon-sm" />
            Act now
          </Chip>
          <Chip tier="next">
            <TierIcon tier="next" className="icon-sm" />
            Up next
          </Chip>
          <Chip tier="later">
            <TierIcon tier="later" className="icon-sm" />
            When you can
          </Chip>
          <Chip tier="fyi">
            <TierIcon tier="fyi" className="icon-sm" />
            For your info
          </Chip>
          <Chip tier="success">Done</Chip>
          <Chip tier="neutral">On break</Chip>
          <Chip tier="now">
            <Clock aria-hidden />
            Due in 50 min
          </Chip>
          <Chip tier="next" size="sm">
            2 h late
          </Chip>
        </div>
      </section>

      <section aria-labelledby="surface-heading" className="flex flex-col gap-4">
        <h2 id="surface-heading" className="t-section text-(--text-1)">
          Surfaces
        </h2>
        <p className="t-body max-w-[68ch] text-(--text-2)">
          A card is one hairline plus one shadow step. In dark, alpha-white borders compound, so a
          bordered card never contains another — the inner box steps the surface instead.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="p-4">
            <p className="t-meta text-(--text-1)">Panel · card</p>
            <Panel tone="inner" className="mt-3 p-3">
              <p className="t-meta text-(--text-2)">Panel · inner, for a box inside a card</p>
            </Panel>
          </Panel>
          <Panel tone="overlay" radius="r-5" className="p-4">
            <p className="t-meta text-(--text-1)">Panel · overlay</p>
            <p className="t-meta mt-1 text-(--text-2)">Popovers, menus, the palette, the toast</p>
          </Panel>
        </div>
        <div className="overflow-hidden rounded-(--r-4) border border-(--line-1)">
          <SectionBand
            icon={<TierIcon tier="now" className="icon-sm text-(--act-fg)" />}
            label={<span className="text-(--act-fg)">Act now</span>}
            count={1}
          />
          <div className="bg-(--surface-1) px-4 py-3">
            <p className="t-row text-(--text-1)">Order #4821 — payment mismatch</p>
            <p className="t-meta text-(--text-2)">Blocking fulfillment · 24 orders held</p>
          </div>
          <SectionBand
            icon={<TierIcon tier="next" className="icon-sm text-(--next-fg)" />}
            label={<span className="text-(--next-fg)">Up next</span>}
            count={3}
          />
        </div>
      </section>

      <section aria-labelledby="feedback-heading" className="flex flex-col gap-4">
        <h2 id="feedback-heading" className="t-section text-(--text-1)">
          Feedback and absence
        </h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Toast
            message="Done: Order #4821 — payment mismatch"
            detail="Next: Label printer offline at Pack 7"
            action={
              <Button variant="ghost" size="sm">
                Undo
              </Button>
            }
          />
          <div className="flex items-center gap-2 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4">
            <span className="t-meta text-(--text-2)">Open search</span>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Panel>
            <EmptyState
              title="Nothing waiting on you"
              description="When something needs a decision, it shows up here first."
              action={
                <Button variant="secondary" size="sm">
                  See the team board
                </Button>
              }
            />
          </Panel>
          <Panel className="flex flex-col gap-3 p-4">
            <p className="t-meta text-(--text-2)">Skeleton — no shimmer, ever</p>
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-7 w-20" />
            </div>
          </Panel>
        </div>
      </section>

      <GlyphMatrix />

      <AnatomySection />

      <section aria-labelledby="wire-heading" className="flex flex-col gap-4">
        <h2 id="wire-heading" className="t-section text-(--text-1)">
          The same components in wire
        </h2>
        <p className="t-body max-w-[68ch] text-(--text-2)">
          Not a filter, and not a second set of components: the chroma multiplier goes to zero,
          radii collapse, depth turns off, and the sans becomes the mono. Everything below is the
          same code as above.
        </p>
        <ModePanel mode="wire" label={false} className="flex-row flex-wrap items-center gap-3 bg-(--surface-1)">
          <Button>Reroute orders</Button>
          <Button variant="secondary">Ask for help</Button>
          <Chip tier="now">
            <TierIcon tier="now" className="icon-sm" />
            Act now
          </Chip>
          <Chip tier="next">
            <TierIcon tier="next" className="icon-sm" />
            Up next
          </Chip>
          <Chip tier="later">
            <TierIcon tier="later" className="icon-sm" />
            When you can
          </Chip>
          <Input placeholder="Order number" className="w-40" aria-label="Order number in wire mode" />
        </ModePanel>
      </section>
    </div>
  );
}
