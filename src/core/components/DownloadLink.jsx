import { useLayoutEffect, useState } from 'react';

export function DownloadLink({ content, mimeType, fileName, onDownload, children, ...props }) {
  const [file, setFile] = useState(null);

  useLayoutEffect(() => {
    if (content == null) return;

    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    setFile({ content, mimeType, url });
    return () => URL.revokeObjectURL(url);
  }, [content, mimeType]);

  const href = file?.content === content && file.mimeType === mimeType ? file.url : undefined;

  return (
    <a
      {...props}
      href={href}
      download={fileName}
      aria-disabled={!href}
      onClick={(event) => {
        if (!href) {
          event.preventDefault();
          return;
        }
        onDownload?.(event);
      }}
    >
      {children}
    </a>
  );
}
