import type { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

import type { TeamMentionProvider } from '../../../components//mention/resource';
import type {
  MentionDescription,
  MentionProvider,
} from '../../../components/mention';
import type { ContextIdentifierProvider } from '../../../editor-common';

export interface TeamInfoAttrAnalytics {
  teamId: String;
  includesYou: boolean;
  memberCount: number;
}

export interface MentionPluginConfig {
  HighlightComponent?: React.ComponentType;
  // flag to indicate display name instead of nick name should be inserted for mentions
  // default: false, which inserts the nick name
  insertDisplayName?: boolean;
}

export interface MentionPluginOptions extends MentionPluginConfig {
  createAnalyticsEvent?: CreateUIAnalyticsEvent;
  sanitizePrivateContent?: boolean;
  useInlineWrapper?: boolean;
  allowZeroWidthSpaceAfter?: boolean;
}

export type MentionPluginState = {
  mentionProvider?: MentionProvider | TeamMentionProvider;
  contextIdentifierProvider?: ContextIdentifierProvider;
  mentions?: Array<MentionDescription>;
};
