import * as React from 'react';
import { Suspense, lazy, useState } from 'react';
import { Link, Route, Routes, Outlet } from 'react-router-dom';

import { componentsMdxPaths } from '../config/mdx-registry';
import { getCompNameFromPath, getCompRelativePath } from '../utils/mdx-helper';

const mdxPathsArr = componentsMdxPaths.map((comp) => comp.path);

export function CompHome(props) {
  const [curName, setCurName] = useState('');

  const handleClick = (name) => {
    setCurName(name);
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: 200,
            backgroundColor: 'beige',
          }}
          className='left-toc-placeholder'
        >
          {mdxPathsArr.map((path, index) => (
            <p key={path}>
              <Link to={`${getCompNameFromPath(path).toLowerCase()}`}>
                {getCompNameFromPath(path)}
              </Link>
            </p>
          ))}
        </div>
        <Suspense fallback={<div>Loading comp mdx docs...</div>}>
          <div
            style={{
              // backgroundColor: 'lightyellow',
              margin: '16px',
            }}
            className='right-main-placeholder'
          >
            <Routes>
              {componentsMdxPaths
                .filter((comp) => comp.status !== 'hidden')
                .map((comp) => {
                  const LoadedDoc = lazy(() => {
                    console.log(getCompRelativePath(comp.path));
                    return import(
                      `../../src/${getCompRelativePath(comp.path)}`
                    );
                  });
                  return (
                    <Route
                      key={comp.path}
                      path={`${getCompNameFromPath(comp.path).toLowerCase()}`}
                      element={<LoadedDoc />}
                    />
                  );
                })}
            </Routes>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
