interface BrandHeaderProps {
  logoSize?: "sm" | "md" | "lg";
  className?: string;
}

export const BrandHeader = ({
  logoSize = "lg",
  className = "",
}: BrandHeaderProps) => {
  const logoSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/Noticat.svg"
        alt="Noticat"
        className={`${logoSizeClasses[logoSize]} logo-smooth`}
      />
      <span className="text-lg font-medium text-neutral-900">
        <span className="font-bold">Noti</span>
        <span className="font-normal">cat</span>
      </span>
    </div>
  );
};
