import { getSyncProfiles, registerSyncPlugin, sync } from '../idbsidesync';
import { GoogleDrivePlugin } from '../plugins/google-drive/GoogleDrivePlugin';
import {
  addProfileName,
  addTodo,
  addTodoType,
  deleteDB,
  deleteTodo,
  deleteTodoType,
  getActiveProfileName,
  getAllProfileNames,
  getAllTodos,
  getBgColorSetting,
  getDB,
  getFontSizeSetting,
  getNumTodos,
  getTodo,
  getTodoTypes,
  undeleteTodo,
  updateActiveProfileName,
  updateBgColorSetting,
  updateFontSizeSetting,
  updateTodo,
} from './db';
import { type AppMainStateType } from './types';
import {
  append,
  classes,
  clear,
  getColor,
  initDefaultUiState,
  qs,
  qsa,
  sanitize,
} from './utils';

/** app主要状态，大多ui相关状态，放在内存 */
let uiState: AppMainStateType = initDefaultUiState();

let _scrollTop = 0;
function saveScroll() {
  const scroller = qs('#scroller');
  if (scroller) {
    _scrollTop = scroller.scrollTop;
  }
}
function restoreScroll() {
  const scroller = qs('#scroller');
  if (scroller) {
    scroller.scrollTop = _scrollTop;
  }
}

let _activeElement: string | null = null;
function saveActiveElement() {
  const el = document.activeElement;
  _activeElement = el?.id
    ? '#' + el.id
    : el?.className
      ? '.' +
        el.className
          .replace(/ ?hover:[^ ]*/g, '')
          .replace(/ /g, '.')
          .replace(/:/g, '\\:')
          .replace(/.$/, '')
      : null;
}
function restoreActiveElement() {
  const autofocusElements = qsa('[autofocus]');
  if (autofocusElements && autofocusElements.length === 1) {
    autofocusElements[0].focus();
  } else if (_activeElement) {
    const elements = qsa(_activeElement);
    // Cheap focus management: only re-focus if there's a single
    // element, otherwise we don't know which one was focused
    if (elements.length === 1) {
      elements[0].focus();
    }
  }
}

/**
 * todo 去掉副作用
 */
async function renderProfileNames() {
  return `
    <label for="profiles" class="flex justify-between items-center mb-4 mr-7">
      <span class="text-gray-500 flex-grow">Theme:</span>
      <select name="profiles" onchange="onStyleProfileChange()" class="${
        classes.select
      }">
        ${(await getAllProfileNames()).map(
          (profile) =>
            `<option ${
              uiState.activeProfileName === profile.name ? 'selected' : ''
            }>${profile.name}</option>`,
        )}
        <option value="add-new-profile">Add new theme...</option>
      </select>
    </label>

  `;
}

function renderTodoTypes({
  todoTypes = [],
  className = '',
  showBlank = true,
} = {}) {
  return `
    <select
      name="types"
      class="flex-grow ${classes.select} mx-1 sm:mx-2 mb-3 ${className}"
    >
      ${showBlank ? '<option value="">Select type...</option>' : ''}
      ${todoTypes.map(
        (type) => `<option value="${type['id']}">${type['name']}</option>`,
      )}
      <option value="add-type">Add type...</option>
      <option value="delete-type">Delete type...</option>
    </select>
  `;
}

function renderTodos({ root, todos, isDeleted = false }) {
  todos.forEach((todo) => {
    append(
      // prettier-ignore
      `
        <div class="todo-item p-2 rounded flex" data-id="${todo.id}">
          <input type="checkbox" ${todo.done ? 'checked' : ''} class="checkbox mr-4 h-6 w-6 rounded" data-id="${todo.id}" />
          <div class="flex-grow flex items-center">
            <div class="${isDeleted ? 'line-through' : ''}">${sanitize(todo.name)}</div>
            <div class="text-sm rounded ${todo.type ? getColor(todo.type.color) : ''} px-2 ml-3">
              ${todo.type ? sanitize(todo.type.name) : ''}
            </div>
          </div>
          <button class="btn-edit hover:bg-gray-400 px-2 rounded" data-id="${todo.id}">✏️</button>
          <button class="btn-delete ml-1 hover:bg-gray-400 px-2 rounded" data-id="${todo.id}">${isDeleted ? '♻️' : '🗑'}</button>
        </div>
      `,
      root,
    );
  });
}

let renderCount = 0;
export async function render() {
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  console.log(';; ==renderCount ', renderCount++);

  saveScroll();
  saveActiveElement();

  const root = qs('#root');
  root.style.height = '100%';

  const { editingTodo } = uiState;
  clear();

  const disableSyncBtn = uiState.sync.inProgress || !uiState.sync.enabled;

  const todoTypes = await getTodoTypes();
  const allTodos = await getAllTodos();
  const deletedTodos = await getAllTodos(true);

  // prettier-ignore 渲染整体页面结构，顶部导航条、列表、同步设置项；👀 注意onclick里面有字符串函数
  append(`
    <div class="flex flex-col h-full">
      <div
        class="fixed w-screen p-2 z-10 bg-gradient-to-br from-green-400 to-blue-500 font-sans text-lg font-bold text-white shadow-md flex justify-center"
      >
        <div class="max-w-screen-md flex items-center flex-grow justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
              <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
              <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
              <line x1="11" y1="6" x2="20" y2="6" />
              <line x1="11" y1="12" x2="20" y2="12" />
              <line x1="11" y1="18" x2="20" y2="18" />
            </svg>
            <h3 class="ml-1">IDBSideSync: Test/Demo</h3>
          </div>
          <button id="btn-show-style-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 21a9 9 0 1 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />
              <circle cx="7.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="12" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="16.5" cy="10.5" r=".5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div id="scroller" class="flex flex-col flex-grow items-center pt-4 px-4 mt-12 relative">
        <div class="w-full max-w-screen-md">
          <form id="add-form" class="flex flex-wrap">
            <input
              type="text"
              placeholder="Enter todo..."
              class="flex-grow mb-3 mx-1 sm:mx-2 ${classes.textInput}"
            />
            ${renderTodoTypes({ todoTypes: todoTypes })}
            <button
              id="btn-add-todo"
              class="flex-grow sm:flex-grow-0 h-12 mx-1 sm:mx-2 px-4 sm:px-8 bg-green-600 text-white rounded shadow
                focus:outline-none focus:ring-2 focus:ring-blue-600"
            >Add</button>
          </form>

          <div class="px-2">
            <h2 class="text-lg mt-2">To Do (# ${allTodos.length} ):</h2>
            <div id="todos"></div>

            <h2 class="text-lg mt-6">Deleted (# ${deletedTodos.length} ):</h2>
            <div class="mt-8" id="deleted-todos"></div>
          </div>
        </div>
      </div>

      <div class="fixed w-screen bottom-0 flex justify-center bg-gray-200 border-gray-400 border-t">
        <div class="max-w-screen-md">
          <!-- 👀 点击函数是str -->
          <button
            ${disableSyncBtn ? 'disabled' : ''}
            id="syncNow"
            class="m-4 mr-6 text-white rounded p-2 bg-blue-${
              disableSyncBtn ? '300 cursor-default' : '600'
            }"
          >Sync${uiState.sync.inProgress ? 'ing...' : ''}</button>
          <button
            id="configSyncSettings"
            class="m-4 mr-6 bg-blue-600 text-white rounded p-2"
          >Sync Settings</button>
          <button
            id="showResetWarningModal"
            class="m-4 mr-6 bg-red-500 text-white rounded p-2"
          >ClearData</button>
        </div>
      </div>
    </div>
  `);

  renderTodos({ root: qs('#todos'), todos: allTodos });
  renderTodos({
    todos: deletedTodos,
    root: qs('#deleted-todos'),
    isDeleted: true,
  });

  if (editingTodo) {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Edit To-Do</h2>
          <div class="flex flex-col">
            <input value="${sanitize(editingTodo.name)}" class="${
              classes.textInput
            }" />
            <button id="btn-edit-save" class="${
              classes.buttonPrimary
            } mt-4 mb-4">Save</button>
            <button id="btn-edit-cancel" class="${
              classes.buttonSecondary
            }">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'please-wait') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <div class="flex flex-col items-center">
            <svg
              class="animate-spin h-8 w-8 my-4 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${
              uiState.waitModalMessage
                ? `<div class="my-4">${uiState.waitModalMessage}</div>`
                : ''
            }
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'add-todo-type') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Add To-Do Type</h2>
          <div class="flex flex-col">
            <input
              autofocus
              type="text"
              placeholder="Enter type (e.g., &quot;Groceries&quot;)..."
              class="${classes.textInput} flex-grow mx-2 mb-4 p-2" />
              <div class="mx-2 flex justify-end">
                <button id="btn-edit-cancel" class="${classes.buttonSecondary}">Cancel</button>
                <button id="btn-edit-save" class="${classes.buttonPrimary} ml-4">Save</button>
              </div>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'error-modal') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">🦖 Whoops!</h2>
          <div class="text-sm">Looks like something went wrong...</div>
          <div class="text-xs text-red-700 font-mono m-2 p-2">${uiState.errorMsg}</div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button onClick="closeModal()" class="${classes.buttonPrimary}">OK</button>
          </div>
        </div>
      </div>
    `);
  }

  // 删除indexeddb数据的确认信息警告
  if (uiState.modal === 'reset-warning') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Reset local data?</h2>
          <div class="text-gray-700 text-sm">
            This will delete all locally-stored data, including sync login settings. It will NOT delete anything stored remotely.
          </div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button
              id="resetDataConfirm"
              class="${classes.buttonDanger} mt-6 mb-4">Yes, Reset Local Data</button>
            <button onClick="closeModal()" class="${classes.buttonSecondary}">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  // 打开连接云存储的通用界面
  if (uiState.modal === 'sync-settings/main-menu') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Sync Settings</h2>
          <div class="text-gray-700 text-sm">
            If you want your data to stay in sync across different web browsers (e.g., one on your phone and one on
            your desktop), you'll need to set up a remote file storage service. This will be used as a common location where each browser you use can upload and download the changes it makes (i.e., CRDT operation messages).
          </div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button
            id="gDriveLogin"
            class="${classes.buttonPrimary} mt-6 mb-4">Google Drive</button>
            <button onClick="closeModal()" class="${classes.buttonSecondary}">Done</button>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'sync-settings/gdrive') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Google Drive</h2>
          <div class="text-sm">
            You are currently signed in as
            ${uiState.gdrive.currentUser.firstName} ${uiState.gdrive.currentUser.lastName}
            (${uiState.gdrive.currentUser.email}) and your app data is being sync'ed to a folder called
            <a href="${uiState.gdrive.settings.remoteFolderLink}" target="_blank" class="underline text-blue-600">
              ${uiState.gdrive.settings.remoteFolderName}
            </a>.
          </div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button id="gDriveLogout" class="${classes.buttonPrimary} mt-6 mb-4">Sign Out</button>
            <button onClick="closeModal()" class="${classes.buttonSecondary}">Close</button>
          </div>
        </div>
      </div>
    `);
  }

  // 准备登录google
  if (uiState.modal === 'sync-settings/gdrive/sign-in') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Setup Google Drive</h2>
          <p class="mb-4 text-sm">Clicking the button below will launch Google's sign-in process.</p>
          <p class="text-sm">
            After signing in, Google will prompt you to allow (or deny) the ability for this app to manage files and
            folders that it has created in your Google Drive.
          </p>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button id="gDriveLoginStart" class="${classes.buttonPrimary} mt-6 mb-4">
              Launch Google Sign-In
            </button>
            <button onClick="closeModal()" class="${classes.buttonSecondary}">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  //
  if (uiState.modal === 'sync-settings/gdrive/sign-in/in-progress') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Google Sign-In in Progress...</h2>
          <div class="mb-4 text-sm">
            The Google sign-in screen should have opened in a pop-up or new window/tab.
            Once you complete the sign-in process, that pop-up will close and this screen will update with your new status.
          </div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button onClick="closeModal()" class="${classes.buttonSecondary}">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'sync-settings/gdrive/sign-in/failed') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Setup Google Drive</h2>
          <div class="text-sm">Oops, the Google sign-in failed:</div>
          <div class="text-xs text-red-700 font-mono m-2 p-2">${uiState.gdrive.loginError}</div>
          <div class="flex flex-col">
            <!-- 👀 点击函数是str -->
            <button onClick="closeModal()" class="${classes.buttonPrimary}">OK</button>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'delete-todo-type') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Delete To-Do Type</h2>
          <div class="pb-2">
            Delete ${await renderTodoTypes({ className: 'selected' })} and
            merge into ${await renderTodoTypes({
              className: 'merge',
              showBlank: true,
            })}
          </div>

          <div class="flex mt-2">
            <button id="btn-edit-delete" class="${
              classes.buttonDanger
            }  p-2 mr-2">Delete</button>
            <button id="btn-edit-cancel" class="${
              classes.buttonSecondary
            } p-2">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  if (uiState.modal === 'preferences') {
    append(`
      <div class="${classes.modalBackground}">
        <div class="${classes.modalContainer}">
          <h2 class="${classes.modalTitle}">Theme Preferences</h2>
          <div class="flex flex-col">
            ${await renderProfileNames()}
            <label for="bg-color-setting" class="flex justify-between items-center mb-4">
              <span class="text-gray-500 flex-grow">Background Color:</span>
              <input
                type="text"
                name="bg-color-setting"
                value="${qs('#root').style.backgroundColor}"
                class="${classes.select} w-32"
                disabled
              />
              <!-- 👀 点击函数是str -->
              <span class="ml-2" onclick="onBgColorSettingClick()">✏️</span>
            </label>
            <label for="font-size-setting" class="flex justify-between items-center mb-4">
              <span class="text-gray-500 flex-grow">Font Size:</span>
              <input
                type="text"
                name="font-size-setting"
                value="${qs('html').style.fontSize}"
                class="${classes.select} w-32"
                disabled
              />
              <!-- 👀 点击函数是str -->
              <span class="ml-2" onclick="onFontSizeSettingClick()">✏️</span>
            </label>
            <button onClick="closeModal()" class="${
              classes.buttonPrimary
            } mt-4">Done</button>
          </div>
        </div>
      </div>
    `);
  }

  addEventHandlers();
  restoreScroll();
  restoreActiveElement();
}

function addEventHandlers() {
  qs('#add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const [nameNode, typeNode] = e.target.elements;
    const name = nameNode.value;
    const type = typeNode.selectedOptions[0].value;

    if (type.includes('-type')) {
      return;
    }

    nameNode.value = '';
    typeNode.selectedIndex = 0;

    if (name === '') {
      alert("Todo can't be blank!");
      return;
    }

    await addTodo({ name, type, order: await getNumTodos() });
    render();
  });

  qs('#configSyncSettings').addEventListener('click', onSyncSettingsBtnClick);
  qs('#gDriveLogin')?.addEventListener('click', onGDriveSettingsBtnClick);
  qs('#gDriveLoginStart')?.addEventListener('click', onGDriveLoginBtnClick);
  qs('#gDriveLogout')?.addEventListener('click', onGDriveLogoutBtnClick);
  qs('#syncNow')?.addEventListener('click', syncNow);
  qs('#showResetWarningModal')?.addEventListener(
    'click',
    showResetWarningModal,
  );
  qs('#resetDataConfirm')?.addEventListener('click', onResetDataBtnClick);

  for (const editBtn of qsa('.todo-item .btn-edit')) {
    editBtn.addEventListener('click', async (e) => {
      const todo = await getTodo(editBtn.dataset.id);
      uiState.editingTodo = todo;
      render();
    });
  }

  for (const todoNode of qsa('.todo-item .checkbox')) {
    todoNode.addEventListener('click', async (e) => {
      updateTodo({ done: e.target.checked }, todoNode.dataset.id);
      render();
    });
  }

  for (const deleteBtn of qsa('.todo-item .btn-delete')) {
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const todo = await getTodo(deleteBtn.dataset.id);
      if (todo.deleted) {
        undeleteTodo(todo.id);
      } else {
        deleteTodo(todo.id);
      }
      render();
    });
  }

  if (uiState.editingTodo) {
    qs('#btn-edit-save').addEventListener('click', (e) => {
      const input = e.target.parentNode.querySelector('input');
      const value = input.value;
      updateTodo({ name: value }, uiState.editingTodo.id);
      uiState.editingTodo = null;
      render();
    });

    if (qs('#btn-edit-undelete')) {
      qs('#btn-edit-undelete').addEventListener('click', (e) => {
        const input = e.target.parentNode.querySelector('input');
        const value = input.value;

        undeleteTodo(uiState.editingTodo.id);
        uiState.editingTodo = null;
        render();
      });
    }
  } else if (uiState.modal === 'add-todo-type') {
    qs('#btn-edit-save').addEventListener('click', (e) => {
      const input = e.target.parentNode.parentNode.querySelector('input');
      const value = input.value;

      const colors = ['red', 'orange', 'yellow', 'teal', 'purple', 'pink'];

      addTodoType({
        name: value,
        color: colors[(Math.random() * colors.length) | 0],
      });
      uiState.modal = null;
      render();
    });
  } else if (uiState.modal === 'delete-todo-type') {
    qs('#btn-edit-delete').addEventListener('click', (e) => {
      const modal = e.target.parentNode;
      const selected = qs('select.selected').selectedOptions[0].value;
      const merge = qs('select.merge').selectedOptions[0].value;

      if (selected === merge) {
        alert('Cannot merge type into itself');
        return;
      }

      deleteTodoType(selected, merge !== '' ? merge : null);

      uiState.modal = null;
      render();
    });
  }

  const cancel = qs('#btn-edit-cancel');
  if (cancel) {
    cancel.addEventListener('click', () => {
      uiState.editingTodo = null;
      uiState.modal = null;
      render();
    });
  }

  qs('select[name=types]').addEventListener('change', async (e) => {
    if (e.target.value === 'add-type') {
      uiState.modal = 'add-todo-type';
      render();
    } else if (e.target.value === 'delete-type') {
      uiState.modal = 'delete-todo-type';
      render();
    }
  });

  qs('#btn-show-style-modal').addEventListener('click', async (e) => {
    uiState.modal = 'preferences';
    render();
  });
}

/** 🚨 下面的方法以字符串形式设置在了html的事件属性 */

async function onStyleProfileChange(e) {
  const selection = qs('select[name=profiles]').value;
  if (selection === 'add-new-profile') {
    const newVal =
      prompt(
        'ADD THEME\n(shared across devices if syncing enabled)\n\nTheme name:',
      ) || '';
    if (newVal.trim() === '') {
      alert(`Ignoring invalid profile name. Please specify a non-empty value.`);
      return;
    } else {
      await addProfileName(newVal);
    }
  } else {
    await updateActiveProfileName(selection);
    uiState.activeProfileName = selection;
    await renderProfileSettings();
  }

  render();
}
/** 简单修改ui状态 */
function closeModal() {
  uiState = {
    ...uiState,
    modal: null,
  };
  render();
}
function showWaitModal(optionalMessage) {
  uiState.modal = 'please-wait';
  uiState.waitModalMessage = optionalMessage;
  render();
}
function showResetWarningModal() {
  uiState.modal = 'reset-warning';
  render();
}
/** 删除indexeddb */
async function onResetDataBtnClick() {
  await deleteDB();
  window.location.reload();
}

function onSyncSettingsBtnClick() {
  uiState.modal = 'sync-settings/main-menu';
  render();
}

let googleDrivePlugin: GoogleDrivePlugin | null = null;

/** 加载 gdrive sdk 相关配置，这里会注册登录成功时会执行的onSignInChange */
async function loadGoogleDrivePlugin() {
  googleDrivePlugin = new GoogleDrivePlugin({
    googleAppKey: 'AIzaSyAA2HnDSahUz3uNpiEfQWXlTW4EqMKgpvg',
    googleAppClientId:
      '783995687622-kdf2g1v3kqq9413nji37a0p5d4teogrr.apps.googleusercontent.com',
    defaultFolderName: 'IDBSideSyncApp',
    onSignInChange: onGoogleSignInChange,
  });

  await registerSyncPlugin(googleDrivePlugin);
}

/** 连接到云存储的入口页 */
async function onGDriveSettingsBtnClick() {
  // Ensure that Google Drive plugin is loaded (i.e., that the Google API client library is loaded).
  if (!googleDrivePlugin) {
    showWaitModal('Loading IDBSideSync Google Drive plugin.');

    try {
      await loadGoogleDrivePlugin();
    } catch (error) {
      console.error('Failed to load IDBSideSync Google Drive plugin:', error);
      const errMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      return showGDriveLoginFailedModal(errMsg);
    }
  }

  console.log(';; gg-login ', uiState.gdrive.currentUser);
  uiState.modal = uiState.gdrive.currentUser
    ? 'sync-settings/gdrive'
    : 'sync-settings/gdrive/sign-in';
  render();
}

/** 开始登录google */
async function onGDriveLoginBtnClick() {
  uiState.modal = 'sync-settings/gdrive/sign-in/in-progress';
  render();
  try {
    // If sign-in succeeds, IDBSideSync will automatically save a "sync profile" to its internal IndexedDB object store.
    // The sync profile includes info about which sync plugin was set up (so that it can automatically be loaded when
    // the app starts up in the future), which remote folder should be used for storage, and some basic user info. It
    // will also trigger a sign-in change event, which causes the "onGoogleSignInChange()" handler to be called.
    googleDrivePlugin?.signIn();
  } catch (error) {
    console.error('Google sign-in failed:', error);
    showGDriveLoginFailedModal(JSON.stringify(error));
  }
}

/** 登录成功时会执行，会注册到loadGDrive */
function onGoogleSignInChange(googleUser, settings) {
  uiState.gdrive.currentUser = googleUser;
  uiState.gdrive.settings = settings;
  uiState.sync.enabled = !googleUser ? false : true;
  if (
    uiState.modal &&
    uiState.modal.startsWith('sync-settings/gdrive/sign-in/in-progress')
  ) {
    uiState.modal = 'sync-settings/gdrive';
  }
  render();
}

function showGDriveLoginFailedModal(errorMessage) {
  uiState.modal = 'sync-settings/gdrive/sign-in/failed';
  uiState.gdrive.loginError = errorMessage;
  render();
}

function onGDriveLogoutBtnClick() {
  googleDrivePlugin?.signOut();
  uiState.modal = 'sync-settings/main-menu';
}

async function onBgColorSettingClick() {
  const currentVal = qs('#root').style.backgroundColor;
  const newVal = prompt(
    'BACKGROUND COLOR\n(applies to all devices if syncing enabled)\n\nColor:',
    currentVal,
  );
  if (newVal) {
    await updateBgColorSetting(uiState.activeProfileName, newVal);
    setBgColor(newVal);
    render();
  }
}

async function onFontSizeSettingClick() {
  const currentVal = parseFloat(qs('html').style.fontSize || 16);
  const newVal = parseFloat(
    prompt(
      'BASE FONT SIZE\n(only applies to current device)\n\nPlease specify number (e.g., "12.5"):',
      String(currentVal),
    ) || '',
  );
  if (!newVal || isNaN(newVal)) {
    alert(
      `Ignoring invalid font size. Please specify a floating point number (e.g., 12.5).`,
    );
  } else {
    await updateFontSizeSetting(uiState.activeProfileName, newVal);
    setFontSize(newVal);
  }
}

function setBgColor(color) {
  qs('#root').style.backgroundColor = color;
}

function setFontSize(size) {
  qs('html').style.fontSize = `${size}px`;
}

/** 从数据库获取profile相关数据，并渲染到dom  */
async function renderProfileSettings() {
  setBgColor((await getBgColorSetting(uiState.activeProfileName)) || 'white');
  setFontSize(await getFontSizeSetting(uiState.activeProfileName));
}

/** 获取已有的或创建新的profileName */
export async function loadAndApplyProfileSettings() {
  // console.log(';; init-setting ', 1);
  const activeProfileName = await getActiveProfileName();
  // console.log(';; init-setting ', 2);
  if (activeProfileName) {
    uiState.activeProfileName = activeProfileName;
    // If a profile exists, try loading profile-specific settings
    await renderProfileSettings();
  } else {
    const defaultProfileName = 'Default';
    await addProfileName(defaultProfileName);
    await updateActiveProfileName(defaultProfileName);
    uiState.activeProfileName = defaultProfileName;
  }
}

/** setInterval返回的轮询同步的timer */
let syncTimer;
function startSyncTimer() {
  syncTimer = window.setInterval(syncNow, 15000);
}
function stopSyncTimer() {
  clearInterval(syncTimer);
}

/** 初始化indexeddb，加载sync相关插件，render */
export async function setupSync() {
  console.log(';; init-sync ', 1);
  // Don't attempt to set up syncing until IDBSideSync has been initialized...
  await getDB();
  console.log(';; init-sync ', 2);
  const syncProfiles = getSyncProfiles();
  console.log(';; syncProfiles ', syncProfiles);
  for (const syncProfile of syncProfiles) {
    if (syncProfile.pluginId === GoogleDrivePlugin.PLUGIN_ID) {
      try {
        console.log('Attempting to load the google drive plugin...');
        await loadGoogleDrivePlugin();
        uiState.gdrive.currentUser = syncProfile.userProfile;
        uiState.gdrive.settings = syncProfile.settings as any;
        uiState.sync.enabled = true;
      } catch (error) {
        console.error('Failed to load Google Drive plugin:', error);
        let errorMsg = `Unable to load the Google Drive plugin.`;
        if (
          typeof error.details === 'string' &&
          error.details.includes('sessionStorage is not available')
        ) {
          if (navigator.userAgent.includes('Firefox')) {
            errorMsg += ` Have you tried disabling Enhanced Tracking Protection for this site? If it's turned on,`;
            errorMsg += ` browser session storage is disabled--which breaks the Google Drive JavaScript client.`;
          } else {
            errorMsg +=
              ' You might need to disable privacy blocking for this site.';
          }
        } else if (error.message) {
          errorMsg += ' ' + error.message;
        }
        uiState.modal = 'error-modal';
        uiState.errorMsg = errorMsg;
      }
    }
  }
  render();
}

/** 同步前后都会执行render */
async function syncNow(forceFullSync = false) {
  console.log(';; sync-Now-ing ');
  uiState.sync.inProgress = true;
  render();
  await sync({ forceFullSync });
  uiState.sync.inProgress = false;
  await loadAndApplyProfileSettings();
  render();
}

/** 添加系统预置的事件类型 */
export async function initDefaultTodoTypes() {
  // console.log(';; init-todo-types ', 1);
  const types = await getTodoTypes();
  // console.log(';; init-todo-types ', 2);
  if (types.length === 0) {
    addTodoType({ name: 'Important', color: 'teal' });
    addTodoType({ name: 'Urgent', color: 'blue' });
  }
}

window['closeModal'] = closeModal;
