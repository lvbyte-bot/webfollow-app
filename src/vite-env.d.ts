/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare function info(...args: any): void
declare function debug(...args: any): void
declare function log(...args: any): void
declare function err(e: Error | unknown, ...args: any): void

declare function setTitle(arg: number): void

declare namespace CryptoJS {
  function MD5(str: string): string;
}


declare const webfollowApp: {
  getUnReadUrl: (currentUrl: string, isNext: boolean) => string,
  toogleSidebar: () => void,
  toggleItemView: () => void,
  toggleItemUnread: () => void,
  upItemsToggleRead: ((item: FeedItem, index: number) => void) | undefined
}
