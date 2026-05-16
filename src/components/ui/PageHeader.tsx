import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
  onBack,
}) => {
  return (
    <div className="mb-8">
      {(breadcrumbs && breadcrumbs.length > 0) || onBack ? (
        <div className="mb-4 flex items-center gap-2 text-sm">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              {onBack && <ChevronRight className="h-4 w-4 text-slate-600" />}
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  )}
                  <a
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      crumb.href
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-slate-400",
                    )}
                  >
                    {crumb.label}
                  </a>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
          {description && <p className="mt-2 text-slate-400">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
