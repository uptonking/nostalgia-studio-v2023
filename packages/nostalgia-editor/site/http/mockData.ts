export const WELCOME_NOTE = {
  _id: '101',
  title: 'Welcome to Keyboardnotes 👋',
  createdAt: new Date().toDateString(),
  body: "> Hit enter to go into edit mode\n\n## This is the preview\n\nWhat you see here is the preview of the note your currently \"standing on\". \n\n## Format\nNotes are formatted using [markdown](https://en.wikipedia.org/wiki/Markdown) and contain a superset of features that allows you to create things like tables, dropdowns and checkboxes. \n\n## Why?\nI built this tool for myself, since I couldn't find any good note taking app that store notes online and was completely accessible through the keyboard. I also didn't want to bother grasping obscure special concepts specific to each app. I just wanted a simple app where I could easily jot down things that come to mind throughout the day, that's quickly accessible through any browser and where I wouldn't have to touch the mouse or trackpad.",
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const starterTutorials = [
  WELCOME_NOTE,
  {
    _id: '102',
    title: 'Overview',
    createdAt: addDays(new Date(), -2).toDateString(),
    body: '- features: \n - localizable',
  },
  {
    _id: '103',
    title: 'Edit',
    createdAt: addDays(new Date(), -2).toDateString(),
    body: '- markdown: \n - mdx',
  },
  {
    _id: '104',
    title: 'Export',
    createdAt: addDays(new Date(), -5).toDateString(),
    body: '- markdown: \n - json',
  },
];
