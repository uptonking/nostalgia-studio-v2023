// * vanillajs 实现最简单的react app，去掉所有react api

/** 👉🏻️ 1. defines a React element. */
// const element = <h1 title='foo'>hello</h1>;
// const element = React.createElement(
//   'h1',
//   {title:'foo'},
//   'hello'
// )
// react element就是一个普通的js对象
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 's0-starter-vanillajs',
  },
};

/** 👉🏻️ 2. gets a node from the existing DOM. */
const container = document.getElementById('root');

/** 👉🏻️ 3. renders the React element/vdom into the dom container. */
// ReactDOM.render(element, container);
const node = document.createElement(element.type);
node['title'] = element.props.title;
const textNode = document.createTextNode('');
textNode['nodeValue'] = element.props.children;

node.appendChild(textNode);
container.appendChild(node);
