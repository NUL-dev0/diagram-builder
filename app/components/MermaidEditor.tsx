'use client';

import CodeMirror from '@uiw/react-codemirror';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MermaidEditor({ value, onChange }: Props) {
  return (
    <div className="h-full overflow-auto border-t">
      <CodeMirror
        value={value}
        height="192px"
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: false,
          autocompletion: false,
        }}
        style={{ fontSize: '0.8125rem', fontFamily: 'ui-monospace, monospace' }}
      />
    </div>
  );
}
