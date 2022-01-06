import { MentionDescription } from '../../../components/mention';
import { INVITE_ITEM_DESCRIPTION } from './ui/InviteItem';

export const isTeamType = (userType: any): boolean => userType === 'TEAM';

export const isTeamStats = (stat: any): boolean =>
  stat && !isNaN(stat.teamMentionDuration);

export const isInviteItem = (mention: MentionDescription): boolean =>
  mention && mention.id === INVITE_ITEM_DESCRIPTION.id;
