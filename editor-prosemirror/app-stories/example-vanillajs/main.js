/* make requiring prosemirror core libraries possible. The
 * PM global is defined by http://prosemirror.net/examples/prosemirror.js,
 * which bundles all the core libraries.
 */
function require(name) {
  const id = /^prosemirror-(.*)/.exec(name);
  // eslint-disable-next-line no-undef
  const mod = id && PM[id[1].replace(/-/g, '_')];
  if (!mod) throw new Error(`Library basic isn't loaded`);
  return mod;
}

const { EditorState } = require('prosemirror-state');
const { EditorView } = require('prosemirror-view');
const { Schema, DOMParser } = require('prosemirror-model');
const { schema } = require('prosemirror-schema-basic');
const { addListNodes } = require('prosemirror-schema-list');
const { exampleSetup } = require('prosemirror-example-setup');

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

window.view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: exampleSetup({ schema: mySchema }),
  }),
});
