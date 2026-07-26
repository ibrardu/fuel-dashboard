import { Home, SlidersHorizontal, MapPin, Building2 } from "lucide-react";

const LINKS = [
  { href: "#top", label: "Home", Icon: Home, active: true },
  { href: "#whatif", label: "What-If", Icon: SlidersHorizontal },
  { href: "#cities", label: "Cities", Icon: MapPin },
  { href: "#omc", label: "OMCs", Icon: Building2 },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {LINKS.map(({ href, label, Icon, active }) => (
          <a
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
              active ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
