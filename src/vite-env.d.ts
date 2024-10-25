/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare function log(...args: any): void

declare namespace CryptoJS {
  function MD5(str: string): string;
}