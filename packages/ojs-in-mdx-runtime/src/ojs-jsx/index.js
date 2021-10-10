import ojsToJs from './ojs-to-js';

const pragma = `
/* @jsxRuntime classic */
/* @jsx mdx */
/* @jsxFrag mdx.Fragment */
`;

export function ojsToJsx(ojs, options = {}) {
  const outJs = ojsToJs(ojs).replaceAll('export default ', '');
  // console.log(';;ojsToJs, ', outJs);

  return `
  ${pragma}

  ${outJs}

  const makeShortcode = name => props => {
    console.warn("Component %s was not imported, exported, or provided by MDXProvider as global scope", name);
    return <>{props.children}</>;
  };

  const MDXLayout = "wrapper";

  function MDXContent({components, ...props}) {

    const ojsRef = React.useRef(null);

    React.useEffect(() => {
      onbRuntime.module(define, Inspector.into(ojsRef.current));
    }, []);


    return (
      <MDXLayout components={components} {...props}>
        <div ref={ojsRef}></div>
      </MDXLayout>
      );
  }
  MDXContent.isMDXComponent = true;
  `;
}

// function define(runtime, observer) {
//   const main = runtime.module();

//   main.variable(observer()).define(["md"], function(md){return(
//     md\`# Minimal cell test\`
//     )});

//   main.variable(observer("start")).define("start", function(){return(
//     889900
//     )});
//   return main;
// }

// onbRuntime.module(define, name => {
//   if (name === "start") {
//     return new Inspector(ojsRef.current);
//   }
// });

// 注意，使用name的方式时，必须指定 if name === 'aCell'

// export default compile;
