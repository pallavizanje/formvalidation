import React from "react";

/**
 * Base modal component.
 *
 * Props:
 *  open   – controls visibility
 *  onClose – called when backdrop or “Close” is clicked
 *  size   – Tailwind width class (e.g. max-w-sm, max-w-md). default: max-w-md
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  size = "max-w-md"
}) => {
  if (!open) return null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={stop}
        className={`bg-white ${size} w-full rounded-2xl p-6 shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
