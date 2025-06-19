export const projects = [
  {
    title: "Click Counter Pro",
    date: "Jul 13, 2023",
    tech: ["Expo", "React-Native", "TypeScript", "Native-base UI"],
    link: "https://play.google.com/store/apps/details?id=com.devlopersabbir.countnativeapp",
    repo_link: "https://github.com/devlopersabbir/count-native-app",
  },
  {
    title: "Full-stack Digital Shop",
    date: "June 14, 2025",
    tech: ["NestJs", "NextJs", "Socket.Io"],
    link: "/",
    repo_link: "",
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
