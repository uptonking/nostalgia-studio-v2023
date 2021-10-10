import * as React from 'react';

import { Flex, Grid, View } from '@adobe/react-spectrum';

import { ArticlesProvider } from '../../context/articles';
import MainView from './MainView';
import Tags from './Tags';

export function Home(props) {
  return (
    <Grid
      areas={['mainView tagsView']}
      columns={['3fr', '1fr']}
      columnGap='size-300'
      marginX='size-1000'
    >
      <ArticlesProvider>
        <MainView />
        <Tags />
      </ArticlesProvider>
    </Grid>
  );
}

export default Home;
