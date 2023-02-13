# TextDocument

> An immutable text document format using Delta format and broken into lines for optimized rendering.

- Typewriter uses the Delta format, borrowed from Quill.js, and builds on top of it to create its TextDocument.
- Typewriter ships with its own version of Delta that has been slightly modified for better performance for Typewriter's immutable use and to support deep merging of attributes for comment support. 

