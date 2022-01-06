import { JsonLd } from 'json-ld-types';

import { ActionProps, BlockCardResolvedViewProps } from '../../../media-ui';
import { CardProviderRenderers } from '../../state/context/types';
import { extractActions } from '../common/actions/extractActions';
import { extractPreviewAction } from '../common/actions/extractPreviewAction';
import { extractByline } from '../common/byline/extractByline';
import { extractProvider } from '../common/context/extractProvider';
import {
  LinkCommentType,
  LinkProgrammingLanguageType,
  LinkSubscriberType,
  extractCommentCount,
  extractProgrammingLanguage,
  extractSubscriberCount,
} from '../common/detail';
import { LinkDetail } from '../common/detail/types';
import { extractIcon } from '../common/icon';
import { extractLozenge } from '../common/lozenge';
import { extractMembers } from '../common/person/extractMembers';
import { extractPersonAssignedTo } from '../common/person/extractPersonAssignedTo';
import { extractPersonCreatedBy } from '../common/person/extractPersonCreatedBy';
import {
  LinkTypeUpdatedBy,
  extractPersonUpdatedBy,
} from '../common/person/extractPersonUpdatedBy';
import { LinkPerson } from '../common/person/types';
import { extractImage } from '../common/preview/extractImage';
import {
  extractLink,
  extractSummary,
  extractTitle,
  extractTitleTextColor,
} from '../common/primitives';
import { extractTitlePrefix } from '../common/title-prefix/extractTitlePrefix';
import { ExtractBlockOpts } from './types';

const extractBlockIcon = (
  jsonLd: JsonLd.Data.BaseData,
): BlockCardResolvedViewProps['icon'] => {
  const icon = extractIcon(jsonLd);
  if (typeof icon === 'string') {
    return { url: icon };
  } else {
    return { icon };
  }
};

const extractBlockDetails = (jsonLd: JsonLd.Data.BaseData): LinkDetail[] =>
  [
    extractCommentCount(jsonLd as LinkCommentType),
    extractProgrammingLanguage(jsonLd as LinkProgrammingLanguageType),
    extractSubscriberCount(jsonLd as LinkSubscriberType),
  ].filter((detail) => !!detail) as LinkDetail[];

export const extractBlockActions = (
  props: BlockCardResolvedViewProps,
  jsonLd: JsonLd.Data.BaseData,
  opts?: ExtractBlockOpts,
): ActionProps[] => {
  if (opts) {
    const { handleInvoke, handleAnalytics, definitionId, testId } = opts;
    const actions = extractActions(jsonLd, handleInvoke);
    const previewAction = extractPreviewAction(
      definitionId,
      props,
      jsonLd,
      handleInvoke,
      handleAnalytics,
      testId,
    );

    // The previewAction should always be the last action
    if (previewAction) {
      actions.push(previewAction);
    }
    return actions;
  }

  return [];
};

export const extractBlockUsers = (
  jsonLd: JsonLd.Data.BaseData,
): LinkPerson[] | undefined => {
  if (jsonLd['@type'] === 'atlassian:Project') {
    return extractMembers(jsonLd as JsonLd.Data.Project);
  } else if (jsonLd['@type'] === 'atlassian:Task') {
    const assignedMembers = extractPersonAssignedTo(jsonLd as JsonLd.Data.Task);
    if (assignedMembers) {
      return [assignedMembers];
    }
  } else {
    const updatedBy = extractPersonUpdatedBy(jsonLd as LinkTypeUpdatedBy);
    let updatedByMembers;
    if (updatedBy) {
      updatedByMembers = [updatedBy];
    }
    const createdByMembers = extractPersonCreatedBy(jsonLd);
    return updatedByMembers || createdByMembers;
  }
};

export const extractBlockProps = (
  jsonLd: JsonLd.Data.BaseData,
  opts?: ExtractBlockOpts,
  renderers?: CardProviderRenderers,
): BlockCardResolvedViewProps => {
  const props = {
    link: extractLink(jsonLd),
    title: extractTitle(jsonLd),
    titleTextColor: extractTitleTextColor(jsonLd),
    lozenge: extractLozenge(jsonLd),
    icon: extractBlockIcon(jsonLd),
    context: extractProvider(jsonLd),
    details: extractBlockDetails(jsonLd),
    byline: extractSummary(jsonLd) || extractByline(jsonLd),
    thumbnail: extractImage(jsonLd),
    users: extractBlockUsers(jsonLd),
    titlePrefix: extractTitlePrefix(jsonLd, renderers, 'block'),
  };
  return { ...props, actions: extractBlockActions(props, jsonLd, opts) };
};
