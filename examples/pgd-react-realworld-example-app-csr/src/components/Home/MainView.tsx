import * as React from 'react';

import { Button, Flex, Grid, View } from '@adobe/react-spectrum';

import useAuth from '../../context/auth';
import { ITab } from '../../reducers/articleList';
import ArticleList from '../ArticleList';
import TabList from '../common/TabList';

const tabsData: Array<ITab> = [
  { type: 'FEED', label: 'Your Feed' },
  { type: 'ALL', label: 'Global Feed' },
];

export function MainView() {
  const {
    state: { user },
  } = useAuth();

  const tabData = user ? tabsData : [tabsData[1]];

  return (
    <View gridArea='mainView'>
      <TabList data={tabData} />
      <ArticleList />
    </View>
  );
}

export default MainView;
