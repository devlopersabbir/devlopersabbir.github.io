export const projects = [
  {
    title: "ExecuteMe - Code Execution Platform",
    date: "Jun 15, 2025",
    tech: ["NextJs", "TypeScript", "TailwindCSS"],
    link: "https://executeme.vercel.app",
    repo_link: "https://github.com/devlopersabbir/executeme",
  },
  {
    title: "Code Executor Engine",
    date: "Jun 15, 2025",
    tech: ["DevOps", "Docker", "Compile", "Executions"],
    link: "https://devlopersabbir.github.io/executeme",
    repo_link: "https://github.com/devlopersabbir/executeme",
  },
  {
    title: "Amazon Sells Booster",
    date: "May 04, 2025",
    tech: ["React", "Safari", "Chrome/Firefox", "Extension"],
    link: "https://github.com/devlopersabbir/amazon-sells-booster/tree/main/release",
    repo_link: "https://github.com/devlopersabbir/amazon-sells-booster",
  },
  {
    title: "Online Car Shop - Buy/Sell/Rent",
    date: "Aug 24, 2023",
    tech: ["Vue", "Firebase", "Sass"],
    link: "https://car-shop-sand.vercel.app/",
    repo_link: "https://github.com/devlopersabbir/car-shop",
  },
  {
    title: "Shopping Cart - E-commerce",
    date: "Nov 15, 2023",
    tech: ["NextJs", "TypeScript", "Auth"],
    link: "https://car-shop-sand.vercel.app/",
    repo_link: "https://github.com/devlopersabbir/car-shop",
  },
] as const;

export type Projects = typeof projects;
