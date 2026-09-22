const box = { border: '2px solid var(--n-400)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: 'var(--n-500)', fontSize: 13 }

/** Grayscale, no icons, no color. The low fidelity shape of the manager's Team view. */
export function TeamWireframe() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {['Do now', 'May need help', 'No owner', 'Next truck'].map((label) => (
          <div key={label} style={{ ...box, flex: 1, height: 64, padding: 8 }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
        <div style={{ ...box, flex: 1, padding: 10 }}>
          <div>Person. Right now. Load.</div>
          <div style={{ ...box, height: 26, margin: '8px 0' }} />
          <div style={{ ...box, height: 26, margin: '8px 0' }} />
          <div style={{ ...box, height: 26, margin: '8px 0' }} />
          <div style={{ ...box, height: 26, margin: '8px 0' }} />
        </div>
        <div style={{ ...box, width: 220, padding: 10 }}>Needs you. [Assign] [Check in]</div>
      </div>
    </div>
  )
}
