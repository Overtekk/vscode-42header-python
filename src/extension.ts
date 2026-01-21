
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { basename } from 'path'
import vscode = require('vscode')
import moment = require('moment')

import {
  ExtensionContext, TextEdit, TextEditorEdit, TextDocument, Position, Range
} from 'vscode'

import {
  extractHeader, getHeaderInfo, renderHeader,
  supportsLanguage, HeaderInfo
} from './header'

/**
 * Return current user from config or ENV by default
 */
const getCurrentUser = () =>
  vscode.workspace.getConfiguration()
    .get('42headerpython.username') || process.env['USER'] || 'marvin'

/**
 * Return current user mail from config or default value
 */
const getCurrentUserMail = () =>
  vscode.workspace.getConfiguration()
    .get('42headerpython.email') || `${getCurrentUser()}@student.42.fr`

/**
 * Update HeaderInfo with last update author and date, and update filename
 * Returns a fresh new HeaderInfo if none was passed
 */
const newHeaderInfo = (document: TextDocument, headerInfo?: HeaderInfo) => {
  const user = getCurrentUser()
  const mail = getCurrentUserMail()

  const config = vscode.workspace.getConfiguration('42headerpython', document.uri)

  const customAuthor = config.get<string>('customAuthor')

  const authorValue = (customAuthor && customAuthor.trim().length > 0)
  ? customAuthor
  : `${user} <${mail}>`

  return Object.assign({},
    // This will be overwritten if headerInfo is not null
    {
      createdAt: moment(),
      createdBy: user
    },
    headerInfo,
    {
      filename: basename(document.fileName),
      author: authorValue,
      updatedBy: user,
      updatedAt: moment()
    }
  )
}

/**
 * Helper to check if the first line is a Shebang (starts with #!)
 */
const hasShebang = (document: TextDocument): boolean => {
  return document.lineCount > 0 && document.lineAt(0).text.startsWith("#!")
}

/**
 * Helper to locate an existing header taking Shebang into account
 * Returns the Range of the header if found, null otherwise
 */
const findHeaderRange = (document: TextDocument): Range | null => {
  const shebang = hasShebang(document)

  // If shebang exists, we prefer looking at line 2 (offset 2), but we
  // also check line 1 just in case
  const startLines = shebang ? [2, 1] : [0]

  for (const line of startLines) {
    // Determine the end line of the potential header (11 lines height)
    if (document.lineCount < line + 11) continue;

    // Extract the text block where the header should be
    const range = new Range(line, 0, line + 11, 0)
    const text = document.getText(range)

    // Check if it matches a header
    if (extractHeader(text)) {
      return range
    }
  }
  return null
}

/**
 * `insertHeader` Command Handler
 */
const insertHeaderHandler = () => {
  const { activeTextEditor } = vscode.window
  const { document } = activeTextEditor

  if (supportsLanguage(document.languageId))
    activeTextEditor.edit(editor => {
      const currentHeaderRange = findHeaderRange(document)

      if (currentHeaderRange) {
        // UPDATE existing header
        const currentHeader = extractHeader(document.getText(currentHeaderRange))
        editor.replace(
          currentHeaderRange,
          renderHeader(
            document.languageId,
            newHeaderInfo(document, getHeaderInfo(currentHeader!))
          ).trimEnd() + "\n"
        )
      } else {
        // INSERT new header
        if (hasShebang(document)) {
          editor.insert(
            new Position(1, 0),
            "\n" + renderHeader(
              document.languageId,
              newHeaderInfo(document)
            ).trimEnd() + "\n"
          )
        } else {
          editor.insert(
            new Position(0, 0),
            renderHeader(
              document.languageId,
              newHeaderInfo(document)
            ).trimEnd() + "\n"
          )
        }
      }
    })
  else
    vscode.window.showInformationMessage(
      `No header support for language ${document.languageId}`
    )
}

/**
 * Start watcher for document save to update current header
 */
const startUpdateOnSaveWatcher = (subscriptions: vscode.Disposable[]) =>
  vscode.workspace.onWillSaveTextDocument(event => {
    const document = event.document
    const currentHeaderRange = findHeaderRange(document)

    // Only update if a header is explicitly found
    if (supportsLanguage(document.languageId) && currentHeaderRange) {
      const currentHeader = extractHeader(document.getText(currentHeaderRange))

      event.waitUntil(
        Promise.resolve(
          [
            TextEdit.replace(
              currentHeaderRange,
              renderHeader(
                document.languageId,
                newHeaderInfo(document, getHeaderInfo(currentHeader!))
              ).trimEnd() + "\n"
            )
          ]
        )
      )
    }
  },
    null, subscriptions
  )


export const activate = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands
    .registerTextEditorCommand('42headerpython.insertHeader', insertHeaderHandler)

  context.subscriptions.push(disposable)
  startUpdateOnSaveWatcher(context.subscriptions)
}
