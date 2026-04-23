interface ImagePlaceholderProps {
  aspectRatio?: string;
  className?: string;
  label?: string;
}

export function ImagePlaceholder({
  aspectRatio = "1/1",
  className = "",
  label,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`glass-subtle flex items-center justify-center overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <div className="flex flex-col items-center gap-2 text-text-light">
        <svg
          className="w-8 h-8 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {label && <span className="label-sm">{label}</span>}
      </div>
    </div>
  );
}

export function LogoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`glass-subtle flex items-center justify-center w-12 h-12 ${className}`}
    >
      <svg
        className="w-5 h-5 text-text-light opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  );
}

export function AvatarPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`glass flex items-center justify-center rounded-lg overflow-hidden ${className}`}
    >
      <svg
        className="w-1/3 h-1/3 text-text-light opacity-40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  );
}
