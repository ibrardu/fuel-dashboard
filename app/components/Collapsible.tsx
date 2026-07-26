"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Card whose body is collapsed behind a tappable header on mobile and always
 * visible on desktop (lg+).
 */
export default function Collapsible({
  id,
  title,
  icon,
  badge,
  children,
}: {
  id?: string;
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" id={id}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="card-header w-full text-left lg:pointer-events-none lg:cursor-default"
      >
        <h2 className="section-title flex items-center gap-2">
          {icon} {title}
        </h2>
        <span className="flex items-center gap-2">
          {badge}
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div className={open ? "block" : "hidden lg:block"}>{children}</div>
    </div>
  );
}
