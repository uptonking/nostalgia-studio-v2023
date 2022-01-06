import { JsonLd } from 'json-ld-types';
import React from 'react';
import { FC } from 'react';

import {
  AuthorizeAction,
  BlockCardErroredView,
  BlockCardForbiddenView,
  BlockCardNotFoundView,
  BlockCardResolvedView,
  BlockCardResolvingView,
  BlockCardUnauthorisedView,
  CardLinkView,
  ForbiddenAction,
} from '../../../media-ui';
import { extractBlockProps } from '../../extractors/block';
import { ExtractBlockOpts } from '../../extractors/block/types';
import { extractRequestAccessContext } from '../../extractors/common/context';
import { getDefinitionId } from '../../state/helpers';
import { getEmptyJsonLd, getUnauthorizedJsonLd } from '../../utils/jsonld';
import { BlockCardProps } from './types';

export const BlockCard: FC<BlockCardProps> = ({
  url,
  cardState: { status, details },
  authFlow,
  handleAuthorize,
  handleErrorRetry,
  handleFrameClick,
  handlePreviewAnalytics,
  handleInvoke,
  renderers,
  isSelected,
  onResolve,
  testId,
  showActions,
}) => {
  const data =
    ((details && details.data) as JsonLd.Data.BaseData) || getEmptyJsonLd();
  const extractorOpts: ExtractBlockOpts = {
    handleAnalytics: handlePreviewAnalytics,
    handleInvoke,
    definitionId: getDefinitionId(details),
  };

  switch (status) {
    case 'pending':
    case 'resolving':
      return <BlockCardResolvingView testId={testId} isSelected={isSelected} />;
    case 'resolved':
      const resolvedViewProps = extractBlockProps(
        data,
        extractorOpts,
        renderers,
      );
      if (onResolve) {
        onResolve({
          title: resolvedViewProps.title,
          url,
        });
      }
      return (
        <BlockCardResolvedView
          {...resolvedViewProps}
          isSelected={isSelected}
          testId={testId}
          showActions={showActions}
          onClick={handleFrameClick}
        />
      );
    case 'unauthorized':
      const unauthorizedViewProps = extractBlockProps(data, extractorOpts);
      return (
        <BlockCardUnauthorisedView
          {...unauthorizedViewProps}
          isSelected={isSelected}
          testId={testId}
          showActions={showActions}
          actions={handleAuthorize ? [AuthorizeAction(handleAuthorize)] : []}
          onClick={handleFrameClick}
        />
      );
    case 'forbidden':
      const forbiddenViewProps = extractBlockProps(data, extractorOpts);
      const cardMetadata = details?.meta ?? getUnauthorizedJsonLd().meta;
      const requestAccessContext = extractRequestAccessContext({
        jsonLd: cardMetadata,
        url,
        context: forbiddenViewProps.context?.text,
      });
      return (
        <BlockCardForbiddenView
          {...forbiddenViewProps}
          isSelected={isSelected}
          showActions={showActions}
          actions={handleAuthorize ? [ForbiddenAction(handleAuthorize)] : []}
          onClick={handleFrameClick}
          requestAccessContext={requestAccessContext}
        />
      );
    case 'not_found':
      const notFoundViewProps = extractBlockProps(data, extractorOpts);
      return (
        <BlockCardNotFoundView
          {...notFoundViewProps}
          isSelected={isSelected}
          testId={testId}
          onClick={handleFrameClick}
        />
      );
    case 'fallback':
    case 'errored':
      if (authFlow && authFlow === 'disabled') {
        return (
          <CardLinkView
            link={url}
            isSelected={isSelected}
            onClick={handleFrameClick}
            testId={`${testId}-${status}`}
          />
        );
      }
      return (
        <BlockCardErroredView
          link={url}
          isSelected={isSelected}
          onRetry={handleErrorRetry}
          onClick={handleFrameClick}
          testId={testId}
        />
      );
  }
};
