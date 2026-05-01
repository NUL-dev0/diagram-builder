'use client';

import CodeMirror, { oneDark } from '@uiw/react-codemirror';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MermaidEditor({ value, onChange }: Props) {
  return (
    <div className="h-full overflow-auto border-t" style={{ backgroundColor: '#282c34' }}>
      <CodeMirror
        value={value}
        height="100%"
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: false,
          autocompletion: false,
        }}
        theme={oneDark}
        style={{ fontSize: '0.8125rem', fontFamily: 'ui-monospace, monospace' }}
      />
    </div>
  );
}
