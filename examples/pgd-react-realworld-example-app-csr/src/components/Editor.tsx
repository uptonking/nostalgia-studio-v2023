import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ActionButton,
  Button,
  Flex,
  Form,
  Grid,
  Heading,
  Text,
  TextArea,
  TextField,
  View,
} from '@adobe/react-spectrum';

import { createArticle, getArticle, updateArticle } from '../api/ArticlesAPI';
import useAuth from '../context/auth';
import { editorReducer, initalState } from '../reducers/editor';
import ListErrors from './common/ListErrors';

export default function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  // console.log('==Editor-slug, ', slug);

  const {
    state: { user },
  } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    let ignore = false;

    const fetchArticle = async () => {
      try {
        const payload = await getArticle(slug);
        const { title, description, body, tagList } = (payload as any).data
          .article;
        if (!ignore) {
          // dispatch({
          //   type: 'SET_FORM',
          //   form: { title, description, body, tag: '' },
          // });
          // dispatch({ type: 'SET_TAGS', tagList });

          setTitle(title);
          setDescription(description);
          setBody(body);
          setTag(tagList.toString());
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (slug) {
      fetchArticle();
    }
    return () => {
      ignore = true;
    };
  }, [slug]);

  const handelKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(event.key, event.code);
    // if (event.keyCode === 13) {
    if (event.key === 'enter') {
      // dispatch({ type: 'ADD_TAG', tag: event.currentTarget.value });
      // dispatch({ type: 'UPDATE_FORM', field: { key: 'tag', value: '' } });
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    try {
      // const { title, description, body } = state.form;
      const article = {
        title,
        description,
        body,
        tagList: tag && tag.trim() !== '' ? [tag] : [],
        user,
      };
      let payload;

      if (slug) {
        payload = await updateArticle({ slug, ...article });
      } else {
        payload = await createArticle(article);
      }
      navigate(`/article/${payload.data.article.slug}`);
    } catch (error) {
      console.log(error);
      if (error.status === 422) {
        // dispatch({ type: 'SET_ERRORS', errors: error.data.errors });
      }
    }
  };

  return (
    <View UNSAFE_style={{}}>
      <View
        UNSAFE_style={{
          width: `70%`,
          margin: `0 auto`,
          // backgroundColor: 'beige',
        }}
      >
        {/* <Grid justifyContent='center'>
          <View>
            <Heading level={2}>Sign in</Heading>
          </View>
          <View>
            <Link to='/register'>Need an account?</Link>
          </View>
        </Grid> */}

        <View marginTop='size-2s00'>
          {/* {state.errors && <ListErrors errors={state.errors} />} */}
        </View>
        <Form
          method='post'
          onSubmit={handleSubmit}
          labelPosition='top'
          labelAlign='start'
        >
          <TextField
            value={title}
            onChange={setTitle}
            name='title'
            label='Title'
            placeholder='Article Title'
          />
          <TextField
            value={description}
            onChange={setDescription}
            name='description'
            label='Description'
            placeholder="What's this article about?"
          />
          <TextArea
            value={body}
            onChange={setBody}
            minHeight='size-3000'
            name='body'
            label='Article Contents'
            placeholder='Write your article (in markdown)'
          />
          <TextField
            value={tag}
            onChange={setTag}
            name='tag'
            label='Tag'
            placeholder='write a tag and hit Enter'
          />
          <View>{tag && <ArticleTag tag={tag} />}</View>
          <Button
            variant='cta'
            type='submit'
            minWidth='size-1200'
            marginTop='size-400'
            UNSAFE_style={{
              width: '25%',
              // marginLeft: `auto`
            }}
          >
            Publish
          </Button>
        </Form>
      </View>
    </View>
  );
}

function ArticleTag(props) {
  const { tag } = props;

  return (
    <>
      <ActionButton
        UNSAFE_style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderWidth: 0,
          backgroundColor: '#5aa9fa',
          color: 'white',
        }}
      >
        {tag}
      </ActionButton>
      <ActionButton
        UNSAFE_style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderWidth: 0,
          backgroundColor: 'rgb(234, 234, 234)',
          cursor: 'pointer',
          // color:'white'
        }}
      >
        X
      </ActionButton>
    </>
  );
}
