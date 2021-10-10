import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteArticle } from '../../api/ArticlesAPI';
import { IArticle } from '../../types';

export default function DeleteButton({ article }: { article: IArticle }) {
  const navigate = useNavigate();
  const handleDelete = async () => {
    try {
      await deleteArticle(article.slug);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      style={{ height: '28px' }}
      className='btn btn-outline-danger btn-sm'
      onClick={handleDelete}
    >
      <i className='ion-trash-a' /> Delete Article
    </button>
  );
}
