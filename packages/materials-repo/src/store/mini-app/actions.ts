import {
  ADD_PAGE_CONTENT_TO_CACHES,
  SET_MINI_APP_CONFIG,
  SET_MINI_APP_NAME,
} from './constants';

export function addPageContentToCaches({
  pagePath,
  pageContent,
  pagesContentsCaches,
  openingPagePath,
}: {
  pagePath: string;
  pageContent: string;
  pagesContentsCaches: Record<string, string>;
  openingPagePath?: string;
}) {
  const pagesContentsCaches_ = {
    ...pagesContentsCaches,
    [pagePath]: pageContent,
  };
  return {
    type: ADD_PAGE_CONTENT_TO_CACHES,
    payload: {
      pagesContentsCaches: pagesContentsCaches_,
      openingPagePath,
    },
  };
}

export function setMiniAppName({ miniAppName }: { miniAppName: string }) {
  return {
    type: SET_MINI_APP_NAME,
    payload: {
      miniAppName,
    },
  };
}

export function setMiniAppConfig({
  miniAppOwner,
  miniAppName,
  miniAppId,
  miniAppRoutesConfig,
  miniAppDefaultRoot,
}: {
  miniAppOwner: string;
  miniAppName?: string;
  miniAppId: string;
  miniAppRoutesConfig?: any[];
  miniAppDefaultRoot?: string;
}) {
  return {
    type: SET_MINI_APP_CONFIG,
    payload: {
      miniAppOwner,
      miniAppName,
      miniAppId,
      miniAppRoutesConfig,
      miniAppDefaultRoot,
    },
  };
}
