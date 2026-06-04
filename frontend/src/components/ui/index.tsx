import { ShoppingBag } from 'lucide-react';

// ===== PAGE LOADER =====
export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--color-bg)' }}>
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
      >
        <ShoppingBag className="text-white animate-float" size={28} />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              background: '#f97316',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ===== SKELETON =====
export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden animate-fade-in">
    <div className="skeleton aspect-square" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-4 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-1/2" />
      <div className="skeleton h-5 rounded w-1/3 mt-2" />
      <div className="skeleton h-9 rounded-lg mt-2" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton h-4 rounded"
        style={{ width: `${100 - i * 10}%` }}
      />
    ))}
  </div>
);

// ===== SPINNER =====
export const Spinner = ({ size = 20 }: { size?: number }) => (
  <div
    className="inline-block border-2 rounded-full animate-spin"
    style={{
      width: size,
      height: size,
      borderColor: 'rgba(249,115,22,0.2)',
      borderTopColor: '#f97316',
    }}
  />
);

// ===== STAR RATING =====
interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export const StarRating = ({ rating, count, size = 14, showCount = false }: StarRatingProps) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={star <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
    {showCount && count !== undefined && (
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        ({count.toLocaleString()})
      </span>
    )}
    {!showCount && (
      <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>{rating.toFixed(1)}</span>
    )}
  </div>
);

// ===== BADGE =====
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-orange-50 text-orange-600 border-orange-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    danger: 'bg-rose-50 text-rose-600 border-rose-200',
    info: 'bg-sky-50 text-sky-600 border-sky-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

// ===== EMPTY STATE =====
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    {icon && (
      <div className="text-5xl opacity-40 mb-2">{icon}</div>
    )}
    <h3 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
    {description && (
      <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
    )}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

// ===== MODAL =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
            <button onClick={onClose} className="btn btn-ghost p-1.5 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ===== CONFIRM DIALOG =====
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Konfirmasi', isDestructive = false, isLoading = false,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
    <div className="text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: isDestructive ? 'rgba(244,63,94,0.1)' : 'rgba(249,115,22,0.1)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDestructive ? '#f43f5e' : '#f97316'} strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn btn-secondary flex-1" disabled={isLoading}>Batal</button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="btn flex-1 text-white"
          style={{ background: isDestructive ? '#f43f5e' : '#f97316' }}
        >
          {isLoading ? <Spinner size={16} /> : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

// ===== PAGINATION =====
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-ghost px-3 py-2 text-sm"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
          style={{
            background: p === page ? '#f97316' : 'transparent',
            color: p === page ? 'white' : 'var(--color-text-muted)',
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-ghost px-3 py-2 text-sm"
      >
        →
      </button>
    </div>
  );
};
