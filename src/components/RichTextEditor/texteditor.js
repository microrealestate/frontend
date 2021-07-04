import { nanoid } from 'nanoid';
import getConfig from 'next/config';
import { detect } from 'detect-browser';
import Quill from 'quill';
import './TemplateField';
import './TemplateLoopBlock';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

const browser = detect();

const PIXEL_IN_MILLIMETER = 0.26458333333719;
const MILLIMETER_IN_PIXEL = 3.779527559;
const A4 = {
  height: 297, // mm
  width: 209.9, // mm
};
const PAGE_BREAK_HEIGHT = 14; // px

const EDITOR = {
  // instance,
  // toolbar,
  // wrapper
};

/**
 * Handlers
 */
const _handlePageBreaks = () => {
  // Compute editor height in pixels
  const editorHeight = Number(
    window
      .getComputedStyle(EDITOR.wrapper.querySelector('.ql-editor'))
      .getPropertyValue('height')
      .replace('px', '')
  );
  const editorMarginTop = Number(
    window
      .getComputedStyle(EDITOR.wrapper.querySelector('.ql-editor'))
      .getPropertyValue('margin-top')
      .replace('px', '')
  );
  const heightMM = editorHeight * PIXEL_IN_MILLIMETER;

  // Remove all page breaks
  const containerElement = EDITOR.wrapper.querySelector('.ql-container');
  const pageBreakElements = containerElement.querySelectorAll('.page-break');
  pageBreakElements.forEach((pageBreakElement) => pageBreakElement.remove());

  // Add the page breaks
  const pageCount = Math.round(heightMM / A4.height);
  if (pageCount > 1) {
    for (let i = 1; i <= pageCount; i++) {
      const imgElement = document.createElement('img');
      imgElement.setAttribute('src', `${BASE_PATH}/pagebreak.png`);
      imgElement.setAttribute('height', `${PAGE_BREAK_HEIGHT}px`);
      imgElement.setAttribute('width', '32px');
      imgElement.setAttribute('alt', 'page break');

      const pageBreakElement = document.createElement('div');
      pageBreakElement.append(imgElement);
      pageBreakElement.setAttribute('class', 'page-break');
      pageBreakElement.style.top = `${
        i * A4.height * MILLIMETER_IN_PIXEL +
        editorMarginTop -
        i * PAGE_BREAK_HEIGHT
      }px`;
      containerElement.append(pageBreakElement);
    }
  }
};

export const printHandler = () => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const printDocument = iframe.contentWindow.document;
  const links = document.head.getElementsByTagName('link');
  const styles = document.head.getElementsByTagName('style');
  let linkHTML = '';
  Array.from(links).forEach((link) => (linkHTML += link.outerHTML));
  Array.from(styles).forEach((style) => (linkHTML += style.outerHTML));

  printDocument.write(`
  <!DOCTYPE html>
  <html>
    <head>
      ${linkHTML}
      <style>
        body {
          margin: 0;
        }
        .ql-editor {
          margin: 0;
          border: none;
          box-shadow: none;
        }
        @page {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="ql-container">
        ${EDITOR.wrapper.querySelector('.ql-container').innerHTML}
      </div>
    </body>
  </html>
  `);

  ['.page-break', '.ql-tooltip', '.ql-clipboard']
    .reduce(
      (acc, className) => [
        ...acc,
        ...Array.from(printDocument.querySelectorAll(className)),
      ],
      []
    )
    .forEach((element) => element && element.parentNode.removeChild(element));

  setTimeout(function () {
    try {
      iframe.focus();
      if (browser && ['edge', 'ie'].includes(browser.name)) {
        try {
          iframe.contentWindow.document.execCommand('print', false, null);
        } catch (e) {
          iframe.contentWindow.print();
        }
      } else {
        iframe.contentWindow.print();
      }
    } catch (error) {
      console.error(error);
    } finally {
      iframe.parentNode.removeChild(iframe);
    }
  }, 1000);
};

export const undoHandler = () => {
  if (!EDITOR.instance) {
    return;
  }

  EDITOR.instance.history.undo();
};

export const redoHandler = () => {
  if (!EDITOR.instance) {
    return;
  }

  EDITOR.instance.history.redo();
};

/**
 * functions
 */
export const createTextEditor = (toolbar, wrapper) => {
  if (EDITOR.instance) {
    return EDITOR.instance;
  }
  const editor = document.createElement('div');
  wrapper.append(editor);

  EDITOR.instance = new Quill(editor, {
    theme: 'snow',
    modules: {
      toolbar,
      history: {
        delay: 1000,
        maxStack: 50,
        userOnly: true,
      },
    },
  });
  EDITOR.toolbar = toolbar;
  EDITOR.wrapper = wrapper;

  // listen textEditor changes
  EDITOR.instance.on('text-change', _handlePageBreaks);
  _handlePageBreaks();

  return EDITOR.instance;
};

export const destroyTextEditor = () => {
  EDITOR.instance.off('text-change', _handlePageBreaks);
  EDITOR.wrapper.innerHTML = '';
  EDITOR.instance = null;
  EDITOR.wrapper = null;
};

const _insertTemplateField = (field) => {
  if (!EDITOR.instance) {
    return;
  }

  const range = EDITOR.instance.getSelection(true);
  EDITOR.instance.insertEmbed(
    range.index,
    'template-field',
    {
      ...field,
    },
    Quill.sources.USER
  );
  EDITOR.instance.insertText(range.index + 1, ' ', Quill.sources.USER);
  EDITOR.instance.setSelection(range.index + 1, Quill.sources.SILENT);
};

const _insertTemplateLoopBlock = (field) => {
  if (!EDITOR.instance) {
    return;
  }

  const range = EDITOR.instance.getSelection(true);
  EDITOR.instance.insertText(range.index, '\n', Quill.sources.USER);
  EDITOR.instance.insertEmbed(
    range.index + 1,
    'template-loop-block',
    {
      id: nanoid(),
      ...field,
    },
    Quill.sources.USER
  );
  EDITOR.instance.insertEmbed(
    range.index + 1,
    'template-field',
    {
      ...field,
    },
    Quill.sources.USER
  );
  EDITOR.instance.insertText(range.index + 2, '\n', Quill.sources.USER);
  EDITOR.instance.setSelection(range.index + 2, Quill.sources.SILENT);
};

export const insertField = (field) => {
  if (!EDITOR.instance) {
    return;
  }

  if (field.type !== 'array') {
    _insertTemplateField(field);
  } else {
    _insertTemplateLoopBlock(field);
  }
};

export const getHTML = () => {
  if (!EDITOR.instance) {
    return '';
  }
  return EDITOR.wrapper.querySelector('.ql-editor').innerHTML;
};
