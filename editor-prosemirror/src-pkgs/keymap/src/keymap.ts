import {base, keyName} from "w3c-keyname"
import {Plugin, Command} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

const mac = typeof navigator !== "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false

function normalizeKeyName(name: string) {
  const parts = name.split(/-(?!$)/); let result = parts[parts.length - 1]
  if (result == "Space") result = " "
  let alt; let ctrl; let shift; let meta
  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i]
    if (/^(cmd|meta|m)$/i.test(mod)) meta = true
    else if (/^a(lt)?$/i.test(mod)) alt = true
    else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true
    else if (/^s(hift)?$/i.test(mod)) shift = true
    else if (/^mod$/i.test(mod)) { if (mac) meta = true; else ctrl = true }
    else throw new Error("Unrecognized modifier name: " + mod)
  }
  if (alt) result = "Alt-" + result
  if (ctrl) result = "Ctrl-" + result
  if (meta) result = "Meta-" + result
  if (shift) result = "Shift-" + result
  return result
}

function normalize(map: {[key: string]: Command}) {
  const copy: {[key: string]: Command} = Object.create(null)
  for (const prop in map) copy[normalizeKeyName(prop)] = map[prop]
  return copy
}

function modifiers(name: string, event: KeyboardEvent, shift: boolean) {
  if (event.altKey) name = "Alt-" + name
  if (event.ctrlKey) name = "Ctrl-" + name
  if (event.metaKey) name = "Meta-" + name
  if (shift !== false && event.shiftKey) name = "Shift-" + name
  return name
}

/// Create a keymap plugin for the given set of bindings.
///
/// Bindings should map key names to [command](#commands)-style
/// functions, which will be called with `(EditorState, dispatch,
/// EditorView)` arguments, and should return true when they've handled
/// the key. Note that the view argument isn't part of the command
/// protocol, but can be used as an escape hatch if a binding needs to
/// directly interact with the UI.
///
/// Key names may be strings like `"Shift-Ctrl-Enter"`—a key
/// identifier prefixed with zero or more modifiers. Key identifiers
/// are based on the strings that can appear in
/// [`KeyEvent.key`](https:///developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
/// Use lowercase letters to refer to letter keys (or uppercase letters
/// if you want shift to be held). You may use `"Space"` as an alias
/// for the `" "` name.
///
/// Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
/// `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
/// `Meta-`) are recognized. For characters that are created by holding
/// shift, the `Shift-` prefix is implied, and should not be added
/// explicitly.
///
/// You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
/// other platforms.
///
/// You can add multiple keymap plugins to an editor. The order in
/// which they appear determines their precedence (the ones early in
/// the array get to dispatch first).
export function keymap(bindings: {[key: string]: Command}): Plugin {
  return new Plugin({props: {handleKeyDown: keydownHandler(bindings)}})
}

/// Given a set of bindings (using the same format as
/// [`keymap`](#keymap.keymap)), return a [keydown
/// handler](#view.EditorProps.handleKeyDown) that handles them.
export function keydownHandler(bindings: {[key: string]: Command}): (view: EditorView, event: KeyboardEvent) => boolean {
  const map = normalize(bindings)
  return function(view, event) {
    const name = keyName(event); const isChar = name.length == 1 && name != " "; let baseName
    const direct = map[modifiers(name, event, !isChar)]
    if (direct && direct(view.state, view.dispatch, view)) return true
    if (isChar && (event.shiftKey || event.altKey || event.metaKey || name.charCodeAt(0) > 127) &&
        (baseName = base[event.keyCode]) && baseName != name) {
      // Try falling back to the keyCode when there's a modifier
      // active or the character produced isn't ASCII, and our table
      // produces a different name from the the keyCode. See #668,
      // #1060
      const fromCode = map[modifiers(baseName, event, true)]
      if (fromCode && fromCode(view.state, view.dispatch, view)) return true
    } else if (isChar && event.shiftKey) {
      // Otherwise, if shift is active, also try the binding with the
      // Shift- prefix enabled. See #997
      const withShift = map[modifiers(name, event, true)]
      if (withShift && withShift(view.state, view.dispatch, view)) return true
    }
    return false
  }
}
