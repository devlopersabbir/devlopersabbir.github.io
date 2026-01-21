export type Post = {
  title: string;
  description: string;
  pubDate: Date;
  author: string;
  tags?: string[];
  image: string;
  slug: string;
};
