import { ELEMENTS_CHANNEL } from './_constants';
import ContextMentionResource from './api/ContextMentionResource';
import { MentionNameClient } from './api/MentionNameClient';
import {
  DefaultMentionNameResolver,
  MentionNameResolver,
} from './api/MentionNameResolver';
import MentionResource, {
  AbstractMentionResource,
  MentionContextIdentifier,
  MentionProvider,
  MentionResourceConfig,
  MentionStats,
  ResolvingMentionProvider,
  TeamMentionResourceConfig,
  isResolvingMentionProvider,
} from './api/MentionResource';
import PresenceResource, {
  AbstractPresenceResource,
  PresenceProvider,
} from './api/PresenceResource';
import type { SmartMentionConfig } from './api/SmartMentionResource';
import SmartMentionResource from './api/SmartMentionResource';
import TeamMentionResource from './api/TeamMentionResource';
import Mention from './components/Mention';
import ResourcedMention from './components/Mention/ResourcedMention';
import MentionItem from './components/MentionItem';
import MentionList from './components/MentionList';
import { MentionPickerWithAnalytics as MentionPicker } from './components/MentionPicker';
import ResourcedMentionList from './components/ResourcedMentionList';
import TeamMentionHighlight from './components/TeamMentionHighlight';
import TeamMentionHighlightController from './components/TeamMentionHighlight/TeamMentionHighlightController';
import {
  InviteExperimentCohort,
  InviteFlow,
  MentionDescription,
  MentionNameDetails,
  MentionNameStatus,
  MentionsResult,
  TeamMember,
  UserRole,
  isSpecialMention,
} from './types';

export {
  // Classes
  ContextMentionResource,
  MentionResource,
  SmartMentionResource,
  TeamMentionResource,
  PresenceResource,
  DefaultMentionNameResolver,
  AbstractMentionResource,
  AbstractPresenceResource,
  MentionNameStatus,
  // Components
  MentionItem,
  MentionList,
  ResourcedMentionList,
  MentionPicker,
  Mention,
  ResourcedMention,
  TeamMentionHighlight,
  TeamMentionHighlightController,
  // Functions
  isSpecialMention,
  isResolvingMentionProvider,
  // Constants
  ELEMENTS_CHANNEL,
};
export type {
  // Interfaces
  ResolvingMentionProvider,
  MentionProvider,
  PresenceProvider,
  MentionDescription,
  MentionsResult,
  MentionNameResolver,
  MentionNameClient,
  MentionNameDetails,
  // types
  MentionContextIdentifier,
  MentionStats,
  TeamMember,
  MentionResourceConfig,
  SmartMentionConfig,
  TeamMentionResourceConfig,
  InviteExperimentCohort,
  InviteFlow,
  UserRole,
};

export default MentionPicker;
