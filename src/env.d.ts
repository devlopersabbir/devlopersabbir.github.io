interface ImportMetaEnv {
  readonly FORMSPREE_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
