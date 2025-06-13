export const menus = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Blogs", path: "/blogs" },
  { label: "Hire Me", path: "/hire-me" },
] as const;

export type Menus = typeof menus;
