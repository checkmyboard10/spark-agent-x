import { useAgencyTheme } from "@/hooks/useAgencyTheme";
import { Skeleton } from "@/components/ui/skeleton";

interface AgencyLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AgencyLogo = ({ className = "", size = "md" }: AgencyLogoProps) => {
  const { logoUrl, isLoading, settings } = useAgencyTheme();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  if (isLoading) {
    return <Skeleton className={`${sizeClasses[size]} rounded ${className}`} />;
  }

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={settings?.company_name || "Agency Logo"}
        className={`${sizeClasses[size]} object-contain ${className}`}
      />
    );
  }

  // Fallback: show company name or default
  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-primary text-primary-foreground rounded font-bold ${className}`}>
      {(settings?.company_name || "AI")?.charAt(0)}
    </div>
  );
};
