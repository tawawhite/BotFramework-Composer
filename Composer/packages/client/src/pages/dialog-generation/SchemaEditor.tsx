// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonEditor } from '@bfc/code-editor';
import { VisualSchemaEditor } from '@bfc/dialog-generation-flow';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { IStackProps, IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { DropZone } from '../../components/DropZone';
import { FileExtensions } from '../../store/persistence/types';

/**
 * @description
 * Reads the given file as a string and returns its
 * contents in a promise.
 *
 * @param file The file to read.
 */
const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsText(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = reject;
  });
};

const noop = () => {};
const defaultValue: object = {};

const editorTopBarStyles = classNamesFunction<IStackProps, IStackStyles>()({
  root: { backgroundColor: '#fff', height: '45px' },
});

const validateSchemaFileName = (file: File) => file.name.endsWith(FileExtensions.DialogSchema);

type Props = {
  projectId?: string;
  schema: { id: string; content: string };
  onChange: (id: string, content: string) => void;
};

export const SchemaEditor = (props: Props) => {
  const { projectId, schema, onChange } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = React.useRef<any>();
  const getEditorValueRef = React.useRef<() => string>(() => schema.content || JSON.stringify(defaultValue, null, 2));
  const [jsonSchema, setJsonSchema] = React.useState(schema.content || JSON.stringify(defaultValue, null, 2));

  const [showEditor, setShowEditor] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    setJsonSchema(schema.content || JSON.stringify(defaultValue, null, 2));
    editorRef.current?.setValue(schema.content);
  }, [schema.content]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEditorDidMount = (getValue: () => string, editor: any) => {
    editorRef.current = editor;
    getEditorValueRef.current = getValue;
    editorRef.current.setValue(jsonSchema);
  };

  const onSchemaUpdated = (id: string, content: string) => {
    onChange(id, content);

    setJsonSchema(content);
    editorRef.current?.setValue(content);
  };

  const onDropFiles = async (files: readonly File[]) => {
    const file = files[0];
    if (validateSchemaFileName(file)) {
      setErrorMessage('');
      const content = await readFileContent(file);
      onChange(schema.id, content);
    } else {
      setErrorMessage(formatMessage('Please select a valid schema file in json format.'));
    }
  };

  return (
    <Stack styles={{ root: { width: '100%', backgroundColor: '#c8c6c4' } }}>
      <Stack horizontal horizontalAlign="end" styles={editorTopBarStyles} verticalAlign="center">
        <ActionButton onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      </Stack>

      <Stack
        grow
        styles={{
          root: {
            flex: 1,
            position: 'relative',
            overflowY: 'auto',
          },
        }}
      >
        {errorMessage && <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>}
        {!showEditor ? (
          <DropZone
            dropMessage={formatMessage('Drop your schema here')}
            style={{ display: 'flex', flexDirection: 'column' }}
            onDropFiles={onDropFiles}
          >
            <VisualSchemaEditor
              editorId={`${projectId}:${schema.id}`}
              schema={schema}
              onSchemaUpdated={onSchemaUpdated}
            />
          </DropZone>
        ) : (
          <JsonEditor
            editorDidMount={onEditorDidMount}
            editorSettings={{ lineNumbers: true, minimap: true, wordWrap: true }}
            height="calc(100%)"
            options={{ readOnly: true }}
            value={defaultValue}
            onChange={noop}
            onError={noop}
          />
        )}
      </Stack>
    </Stack>
  );
};
