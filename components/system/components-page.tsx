import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { StatesMatrix } from "./states-matrix";

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
    forceState: state === "hover" || state === "active" || state === "focus" ? (state as "hover" | "active" | "focus") : undefined,
    disabled: state === "disabled",
  };
}

export function ComponentsPage() {
  return (
    <div data-fidelity="hi" className="flex max-w-5xl flex-col gap-16">
      <header>
        <h1 className="text-(length:--text-title) font-semibold text-(--text-1)">Components</h1>
        <p className="mt-2 text-(length:--text-body) text-(--text-2)">
          Every primitive in <code className="text-(length:--text-kbd)">components/ui</code>, sized to the
          §4.4 contract, with hover / active / focus / disabled forced for the matrix below (via a{" "}
          <code className="text-(length:--text-kbd)">forceState</code> prop that only exists for this
          page — app code never sets it).
        </p>
      </header>

      <section aria-labelledby="contract-heading" className="flex flex-col gap-3">
        <h2 id="contract-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Size contract: one row, one center
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          Controls in the same row share one height and one vertical center (§4.4, asserted by gate G1).
        </p>
        {(["sm", "md", "lg"] as const).map((size) => (
          <div
            key={size}
            data-testid={`contract-row-${size}`}
            className="flex items-center gap-3 rounded-(--radius-control) border border-(--border-1) p-4"
          >
            <Button size={size}>Reroute orders</Button>
            <Input size={size} placeholder="Order number" className="w-40" />
            <Select size={size} defaultValue="ups" wrapperClassName="w-32" aria-label="Carrier">
              <option value="ups">UPS</option>
              <option value="fedex">FedEx</option>
            </Select>
            <IconButton size={size} aria-label="Add">
              <Plus aria-hidden />
            </IconButton>
            <span className="text-(length:--text-kbd) text-(--text-2)">{size}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="button-heading" className="flex flex-col gap-3">
        <h2 id="button-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Button
        </h2>
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

      <section aria-labelledby="icon-button-heading" className="flex flex-col gap-3">
        <h2 id="icon-button-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
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

      <section aria-labelledby="input-heading" className="flex flex-col gap-3">
        <h2 id="input-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Input
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
      </section>

      <section aria-labelledby="select-heading" className="flex flex-col gap-3">
        <h2 id="select-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Select
        </h2>
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
      </section>

      <section aria-labelledby="chip-heading" className="flex flex-col gap-3">
        <h2 id="chip-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Chip / time pill
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          The base for tier chips and time pills (built out in Phase 3). No interactive states — chips are
          presentational, per §2.3 (rows have no buttons).
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-(--radius-control) border border-(--border-1) p-4">
          <Chip tier="now">Act now</Chip>
          <Chip tier="next">Up next</Chip>
          <Chip tier="later">When you can</Chip>
          <Chip tier="fyi">For your info</Chip>
          <Chip tier="success">Done</Chip>
          <Chip tier="neutral">Neutral</Chip>
          <Chip tier="now" size="sm">
            sm
          </Chip>
        </div>
      </section>

      <section aria-labelledby="form-heading" className="flex flex-col gap-3">
        <h2 id="form-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Label
        </h2>
        <div className="flex max-w-xs flex-col gap-1.5 rounded-(--radius-control) border border-(--border-1) p-4">
          <Label htmlFor="system-demo-carrier">Carrier</Label>
          <Select id="system-demo-carrier" defaultValue="ups">
            <option value="ups">UPS</option>
            <option value="fedex">FedEx</option>
          </Select>
        </div>
      </section>

      <section aria-labelledby="wire-heading" className="flex flex-col gap-3">
        <h2 id="wire-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Wireframe fidelity
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          Same components, tokens swapped (§4.7) — not a filter, a real render.
        </p>
        <div data-fidelity="wire" className="flex flex-wrap items-center gap-3 rounded-(--radius-control) border border-(--border-1) p-4">
          <Button>Reroute orders</Button>
          <Chip tier="now">Act now</Chip>
          <Chip tier="next">Up next</Chip>
          <Input placeholder="Order number" className="w-40" aria-label="Order number" />
        </div>
      </section>
    </div>
  );
}
