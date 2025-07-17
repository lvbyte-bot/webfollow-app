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


declare const ifeedApp: {
  getUnReadUrl: (currentUrl: string, isNext: boolean) => string,
  toogleSidebar: () => void,
  toggleItemView: () => void,
  toggleItemUnread: () => void,
  upItemsToggleRead: ((item: FeedItem, index: number) => void) | undefined,
  view: {
    changeEntryCurrentIndex: (index: number) => void
  },
  filterItems(sqlQuery: string, page: number = 0, size: number = 50): Promise<{ data: FeedItem[], isLast: boolean }>,
  // 消息提示
  tip: (msg: string, time = 8000) => void,
  // 当前页面标记为已读
  markCurrentPageRead: () => void
}

declare const responsiveVoice: {
  speak: (text: string, voice: string, options: any) => void
}