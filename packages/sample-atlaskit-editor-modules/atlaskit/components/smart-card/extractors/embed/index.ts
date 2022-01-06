import { JsonLd } from 'json-ld-types';

import { EmbedCardResolvedViewProps } from '../../../media-ui/embeds';
import { CardPlatform } from '../../view/Card/types';
import { extractProvider } from '../common/context';
import { LinkPreview, extractPreview } from '../common/preview/extractPreview';
import { extractLink, extractTitle } from '../common/primitives';

const extractEmbedPreview = (
  jsonLd: JsonLd.Data.BaseData,
  platform?: CardPlatform,
): (LinkPreview & { src: string }) | undefined => {
  const preview = extractPreview(jsonLd, platform);
  if (preview && preview.src) {
    return { ...preview, src: preview.src };
  }
};

export const extractEmbedProps = (
  jsonLd: JsonLd.Data.BaseData,
  platform?: CardPlatform,
): EmbedCardResolvedViewProps => ({
  link: extractLink(jsonLd) || '',
  title: extractTitle(jsonLd),
  context: extractProvider(jsonLd),
  preview: extractEmbedPreview(jsonLd, platform),
});
