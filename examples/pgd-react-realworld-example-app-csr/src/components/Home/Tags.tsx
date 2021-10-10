import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Flex, Grid, View } from '@adobe/react-spectrum';

import { getTags } from '../../api/TagsAPI';
import useArticles from '../../context/articles';

function Tags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useArticles();

  console.log('==Tags-render');

  useEffect(() => {
    let ignore = false;
    console.log('==Tags-useEffect');

    async function fetchTags() {
      console.log('==Tags-fetchTags');

      setLoading(true);
      try {
        const payload = await getTags();
        if (!ignore) {
          setTags((payload as any).data.tags);
        }
      } catch (error) {
        console.log(error);
      }
      if (!ignore) {
        setLoading(false);
      }
    }

    fetchTags();
    return () => {
      ignore = true;
    };
  }, []);

  return useMemo(() => {
    return (
      <View gridArea='tagsView' marginTop='size-400' maxWidth='size-3600'>
        <View padding='size-200' backgroundColor='gray-200'>
          <p>Popular Tags</p>
          {loading ? (
            <div>Loading Tags...</div>
          ) : (
            <View>
              <div className='tag-list'>
                {tags.map((tag, index) => {
                  console.log(index > tags.length - 2 ? index : '');
                  return (
                    <button
                      key={index}
                      className='tag-pill tag-default'
                      onClick={() =>
                        dispatch({
                          type: 'SET_TAB',
                          tab: { type: 'TAG', label: tag },
                        })
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </View>
          )}
        </View>
      </View>
    );
  }, [dispatch, loading, tags]);
}

export default Tags;
