// import * as React from 'react';

// import Editor from '../src/nostalgia-editor';
// import { dark, light } from '../src/nostalgia-editor/theme';

// const docSearchResults = [
//   {
//     title: 'Hiring',
//     subtitle: 'Created by Jane',
//     url: '/doc/hiring',
//   },
//   {
//     title: 'Product Roadmap',
//     subtitle: 'Created by Tom',
//     url: '/doc/product-roadmap',
//   },
//   {
//     title: 'Finances',
//     subtitle: 'Created by Coley',
//     url: '/doc/finances',
//   },
//   {
//     title: 'Security',
//     subtitle: 'Created by Coley',
//     url: '/doc/security',
//   },
//   {
//     title: 'Super secret stuff',
//     subtitle: 'Created by Coley',
//     url: '/doc/secret-stuff',
//   },
//   {
//     title: 'Supero notes',
//     subtitle: 'Created by Vanessa',
//     url: '/doc/supero-notes',
//   },
//   {
//     title: 'Meeting notes',
//     subtitle: 'Created by Rob',
//     url: '/doc/meeting-notes',
//   },
// ];

// class YoutubeEmbed extends React.Component<{
//   attrs: any;
//   isSelected: boolean;
// }> {
//   render() {
//     const { attrs } = this.props;
//     const videoId = attrs.matches[1];

//     console.log(';;YoutubeEmbed rendering');
//     return (
//       <iframe
//         className={this.props.isSelected ? 'ProseMirror-selectednode' : ''}
//         src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
//       />
//     );
//   }
// }

// const embeds = [
//   {
//     title: 'YouTube',
//     keywords: 'youtube video tube google',
//     defaultHidden: true,
//     icon: () => (
//       <img
//         src='https://www.baidu.com/img/540x258_2179d1243e6c5320a8dcbecd834a025d.png'
//         width={48}
//         height={48}
//       />
//     ),
//     matcher: (url) => {
//       return url.match(
//         /(?:https?:\/\/)?(?:www\.)?youtube(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})$/i,
//       );
//     },
//     component: YoutubeEmbed,
//   },
// ];

// export function EmbedExample(props) {
//   const { body } = document;
//   if (body)
//     body.style.backgroundColor = props.dark
//       ? dark.background
//       : light.background;

//   return (
//     <div style={{ padding: '1em 2em' }}>
//       <Editor
//         embeds={embeds}
//         onCreateLink={(title) => {
//           // Delay to simulate time taken for remote API request to complete
//           return new Promise((resolve, reject) => {
//             setTimeout(() => {
//               if (title !== 'error') {
//                 return resolve(
//                   `/doc/${encodeURIComponent(title.toLowerCase())}`,
//                 );
//               } else {
//                 reject('500 error');
//               }
//             }, 1500);
//           });
//         }}
//         onSearchLink={async (term) => {
//           console.log('Searched link: ', term);

//           // Delay to simulate time taken for remote API request to complete
//           return new Promise((resolve) => {
//             setTimeout(() => {
//               resolve(
//                 docSearchResults.filter((result) =>
//                   result.title.toLowerCase().includes(term.toLowerCase()),
//                 ),
//               );
//             }, Math.random() * 500);
//           });
//         }}
//         uploadImage={(file) => {
//           console.log('File upload triggered: ', file);

//           // Delay to simulate time taken to upload
//           return new Promise((resolve) => {
//             setTimeout(() => resolve(URL.createObjectURL(file)), 1500);
//           });
//         }}
//         {...props}
//       />
//     </div>
//   );
// }

// export default EmbedExample;
