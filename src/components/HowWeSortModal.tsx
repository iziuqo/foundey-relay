import { Modal } from './Modal'
import { Button } from './Button'
import { copy } from '../copy'

export function HowWeSortModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={copy.howModal.title} width={480}>
      <div className="flex flex-col gap-3 text-[14px] leading-5 text-n-600">
        <p>{copy.howModal.body}</p>
        <p>
          <strong className="text-n-900">{copy.tiers.now.label}</strong> {copy.howModal.now}
        </p>
        <p>
          <strong className="text-n-900">{copy.tiers.next.label}</strong> {copy.howModal.next}
        </p>
        <p>
          <strong className="text-n-900">{copy.tiers.later.label}</strong> {copy.howModal.later}
        </p>
        <p>{copy.howModal.footer}</p>
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="primary" size="md" onClick={onClose}>
          {copy.actions.gotIt}
        </Button>
      </div>
    </Modal>
  )
}
