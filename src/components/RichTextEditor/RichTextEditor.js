import _ from 'lodash';
import useTranslation from 'next-translate/useTranslation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import PrintIcon from '@material-ui/icons/Print';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import FieldBar from './FieldBar';
import {
  createTextEditor,
  insertField,
  destroyTextEditor,
  getHTML,
  printHandler,
  undoHandler,
  redoHandler,
} from './texteditor';

import { toHandlebars } from './transformer';

const CHECK_CHANGE_INTERVAL_MS = 500;
const SAVE_INTERVAL_MS = 500;
const CLEAR_SAVE_STATE_INTERVAL_MS = 2500;

const RichTextEditorBar = withStyles((theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 1,
  },
}))(AppBar);

let initialLoad = true;
const RichTextEditor = ({
  onLoad,
  onSave,
  onClose,
  title,
  fields,
  showPrintButton,
  placeholder,
}) => {
  const { t } = useTranslation('common');
  const [ready, setReady] = useState(false);
  const [contents, setContents] = useState();
  const [saving, setSaving] = useState();
  const editorToolbarRef = useRef();
  const editorWrapper = useRef();
  const saveIntervalRef = useRef();
  const saveStateIntervalRef = useRef();

  useEffect(() => {
    if (!contents) {
      return;
    }

    if (initialLoad) {
      initialLoad = false;
      return;
    }

    clearInterval(saveIntervalRef.current);
    clearInterval(saveStateIntervalRef.current);
    setSaving();

    let saveInterval;
    let saveStateInterval;
    saveInterval = setInterval(async () => {
      try {
        setSaving(true);
        await onSave(contents, await toHandlebars(getHTML()));
        setSaving((prevSaving) => {
          if (prevSaving === true) {
            saveStateInterval = setInterval(() => {
              setSaving();
              clearInterval(saveStateInterval);
            }, CLEAR_SAVE_STATE_INTERVAL_MS);
            saveStateIntervalRef.current = saveStateInterval;
            return false;
          }
          return prevSaving;
        });
        clearInterval(saveInterval);
      } catch (error) {
        console.log(error);
        setSaving();
      }
    }, SAVE_INTERVAL_MS);
    saveIntervalRef.current = saveInterval;

    return () => {
      clearInterval(saveInterval);
      clearInterval(saveStateInterval);
    };
  }, [contents]);

  useEffect(() => {
    let interval;
    const load = async () => {
      // Create the HTML editor and TextEditor
      const toolbar = editorToolbarRef.current;
      const wrapper = editorWrapper.current;
      const textEditor = createTextEditor(toolbar, wrapper);

      // load document
      initialLoad = true;
      const data = await onLoad();
      if (!data) {
        textEditor.setText(placeholder);
      } else {
        try {
          textEditor.setContents(data);
        } catch (error) {
          console.error(error);
          textEditor.setContents(placeholder);
        }
      }
      setReady(true);

      // Setup the auto save
      interval = setInterval(() => {
        const newContents = textEditor.getContents();
        setContents((prevContents) => {
          if (!_.isEqual(prevContents, newContents)) {
            return newContents;
          }
          return prevContents;
        });
      }, CHECK_CHANGE_INTERVAL_MS);
    };
    load();

    return () => {
      clearInterval(interval);
      destroyTextEditor();
    };
  }, []);

  const onInsertField = useCallback((field) => insertField(field), []);

  const onPrint = useCallback(printHandler, []);
  const onUndo = useCallback(undoHandler, []);
  const onRedo = useCallback(redoHandler, []);

  return (
    <>
      <RichTextEditorBar position="fixed">
        <Toolbar>
          <Box
            display={ready ? 'flex' : 'none'}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box display="flex" flexDirection="column" flexGrow={1}>
              <Box display="flex" alignItems="center" m={1}>
                <Box>
                  <Typography variant="h5">
                    {title || t('Untitled document')}
                  </Typography>
                </Box>
                <Box color="text.disabled" ml={2}>
                  {saving === true && (
                    <Box display="flex" alignItems="center">
                      <SaveIcon fontSize="small" color="inherit" />
                      <Typography
                        variant="caption"
                        color="inherit"
                        component="span"
                      >
                        {t('Saving')}
                      </Typography>
                    </Box>
                  )}
                  {saving === false && (
                    <Typography variant="caption">{t('Saved')}</Typography>
                  )}
                </Box>
              </Box>
              <Box
                ref={editorToolbarRef}
                display="flex"
                flexGrow={1}
                flexWrap="nowrap"
                mb={1.5}
              >
                <button onClick={onUndo}>
                  <UndoIcon fontSize="small" />
                </button>
                <button onClick={onRedo}>
                  <RedoIcon fontSize="small" />
                </button>
                <Divider orientation="vertical" flexItem />
                <select className="ql-header" defaultValue={''}>
                  <option value="1"></option>
                  <option value="2"></option>
                  <option value="3"></option>
                  <option value="4"></option>
                  <option value="5"></option>
                  <option value="6"></option>
                  <option></option>
                </select>
                <Divider orientation="vertical" flexItem />

                <select className="ql-font"></select>
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-underline"></button>
                <button className="ql-strike"></button>
                <button className="ql-color"></button>
                <button className="ql-background"></button>
                <Divider orientation="vertical" flexItem />

                <button className="ql-link"></button>
                <button className="ql-image"></button>
                <Divider orientation="vertical" flexItem />

                <select className="ql-align"></select>
                <Divider orientation="vertical" flexItem />

                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
                <Divider orientation="vertical" flexItem />

                <button className="ql-script" value="sub"></button>
                <button className="ql-script" value="super"></button>
                <Divider orientation="vertical" flexItem />

                <button className="ql-blockquote"></button>
                <Divider orientation="vertical" flexItem />

                <button className="ql-code-block"></button>
                <Divider orientation="vertical" flexItem />

                <button className="ql-clean"></button>
              </Box>
            </Box>

            <Box display="flex">
              {showPrintButton && (
                <Box mr={2}>
                  <Button onClick={onPrint}>
                    <PrintIcon />
                  </Button>
                </Box>
              )}
              <Button variant="contained" size="small" onClick={onClose}>
                {t('Close')}
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </RichTextEditorBar>

      <Box ml={8} mt={14} display="flex" ref={editorWrapper} />

      <Toolbar />
      <FieldBar onInsertField={onInsertField} fields={fields} />
    </>
  );
};

export default RichTextEditor;
