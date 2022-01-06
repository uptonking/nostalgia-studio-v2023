import type {
  CollectionBase,
  DOMProps,
  Expandable,
  StyleProps,
} from '@react-types/shared';

interface AccordionProps<T> extends CollectionBase<T>, Expandable {}

export interface AriaAccordionProps<T> extends AccordionProps<T>, DOMProps {}

export interface SpectrumAccordionProps<T>
  extends AriaAccordionProps<T>,
    StyleProps {}
