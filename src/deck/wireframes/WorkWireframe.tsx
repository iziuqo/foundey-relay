const box = { border: '2px solid var(--n-400)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: 'var(--n-500)', fontSize: 13 }

/** Grayscale, no icons, no color. §12.1, §14. The low fidelity shape of the worker home. */
export function WorkWireframe() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: 12, ...box, borderWidth: 0 }}>
      <div style={{ ...box, width: 90, padding: 8 }}>Nav</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...box, height: 28, padding: 6 }}>Good morning, name. n things need you.</div>
        <div style={{ ...box, height: 110, padding: 10 }}>Do this now. Why first: reason. [Start]</div>
        <div style={{ ...box, flex: 1, padding: 10 }}>
          <div>DO NOW</div>
          <div style={{ ...box, height: 30, margin: '6px 0' }} />
          <div>UP NEXT</div>
          <div style={{ ...box, height: 30, margin: '6px 0' }} />
          <div style={{ ...box, height: 30, margin: '6px 0' }} />
          <div>LATER TODAY</div>
          <div style={{ ...box, height: 30, margin: '6px 0' }} />
        </div>
      </div>
      <div style={{ ...box, width: 140, padding: 8 }}>Next trucks. Progress.</div>
    </div>
  )
}
