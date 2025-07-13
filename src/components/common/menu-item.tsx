import { useState } from "react";
import type { Menus } from "../../constants/menus";
import "./menu-animation.css";

type Props = {
  item: Menus;
};

export const MenuItem = ({ item }: Props) => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  return (
    <li key={item.label} className="relative">
      <div
        className="menu-item block rounded-xl overflow-visible group relative"
        style={{ perspective: "600px" }}
        onMouseEnter={() => setHoveredMenu(item.label)}
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div
          className={`item-glow absolute inset-0 z-0 pointer-events-none rounded-2xl transition-all duration-500 ease-out ${
            hoveredMenu === item.label
              ? "opacity-100 scale-150"
              : "opacity-0 scale-75"
          }`}
          style={{
            background: item.gradient,
          }}
        />
        <a
          href={item.path}
          className={`menu-link-front flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-all duration-500 rounded-xl ${
            hoveredMenu === item.label ? "flip-out" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center bottom",
          }}
        >
          <span
            className={`transition-colors duration-300 ${
              hoveredMenu === item.label ? item.iconColor : "text-foreground"
            }`}
          >
            {item.icon}
          </span>
          <span>{item.label}</span>
        </a>
        <a
          href={item.path}
          className={`menu-link-back flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-all duration-500 rounded-xl ${
            hoveredMenu === item.label ? "flip-in" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center top",
          }}
        >
          <span
            className={`transition-colors duration-300 ${
              hoveredMenu === item.label ? item.iconColor : "text-foreground"
            }`}
          >
            {item.icon}
          </span>
          <span>{item.label}</span>
        </a>
      </div>
    </li>
  );
};
