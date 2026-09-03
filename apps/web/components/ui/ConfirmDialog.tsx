import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  isConfirming?: boolean;
}

/**
 * Reserved for actions the brief calls out as needing deliberate
 * confirmation (suspend account, reject verification, delete a
 * listing). The confirming button names the actual action
 * ("Suspend listing"), never a bare "Yes".
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isDestructive = true,
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button variant={isDestructive ? "danger" : "primary"} onClick={onConfirm} loading={isConfirming}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description}
    </Modal>
  );
}
