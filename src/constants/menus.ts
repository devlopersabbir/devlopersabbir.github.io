export const menus = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Blogs", path: "/blogs" },
  { label: "Contact", path: "/contacts" },
] as const;

export type Menus = typeof menus;
