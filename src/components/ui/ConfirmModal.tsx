import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  danger = true
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
          >
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
            <p className="text-zinc-500 mb-8 text-sm leading-relaxed">{description}</p>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 !bg-zinc-100 hover:!bg-zinc-200" 
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button 
                variant="primary" 
                className={`flex-1 ${danger ? '!bg-red-500 hover:!bg-red-600' : ''}`} 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
