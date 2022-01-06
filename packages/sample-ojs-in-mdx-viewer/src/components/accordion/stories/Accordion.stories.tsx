import * as React from 'react';

import { Item } from '@react-stately/collections';

import { ZendeskAccordion } from '../lab/zendesk-accordion';
import { Accordion } from '../src/Accordion';

export function SimpleAccordion(props) {
  return (
    <Accordion>
      <Item key='files' title='Your files 11'>
        files
      </Item>
      <Item key='shared' title='Shared with you'>
        shared
      </Item>
    </Accordion>
  );
}

export function NestedAccordion(props) {
  return (
    <Accordion>
      <Item key='A1' title='Animals'>
        <Item>Aardvark</Item>
        <Item title='Bear'>
          <Item>Black Bear</Item>
          <Item>Brown Bear</Item>
        </Item>
        <Item>Kangaroo</Item>
        <Item>Snake</Item>
      </Item>
      <Item key='A2' title='Fruits'>
        <Item>Apple</Item>
        <Item>Orange</Item>
        <Item title='Kiwi'>
          <Item>Golden Kiwi</Item>
          <Item>Fuzzy Kiwi</Item>
        </Item>
      </Item>
    </Accordion>
  );
}

export function ZendeskStyleAccordion(props) {
  return (
    <ZendeskAccordion>
      <Item key='files' title='Zendesk Accordion'>
        Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce
        kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus
        winter purslane kale.
      </Item>
      <Item key='shared' title='Shared with you'>
        Celery quandong swiss chard chicory earthnut pea potato. Salsify taro
        catsear garlic gram celery bitterleaf wattle seed collard greens nori.
      </Item>
    </ZendeskAccordion>
  );
}
