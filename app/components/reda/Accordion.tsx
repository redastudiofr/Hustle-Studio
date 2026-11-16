import {useId, useLayoutEffect, useRef, useState} from 'react';
import {ChevronDownIcon} from '~/components/Icons';

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // The panel's real height, measured once it is in the page (before paint),
  // so an open panel is never clipped.
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (open && panelRef.current) setHeight(panelRef.current.scrollHeight);
  }, [open]);

  return (
    <div className={`accordion${open ? ' accordion--open' : ''}`}>
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDownIcon className="accordion__chevron" />
      </button>
      <div
        id={panelId}
        ref={panelRef}
        className="accordion__panel"
        style={{
          maxHeight: open ? `${height}px` : '0px',
          transition: 'max-height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="accordion__panel-inner">{children}</div>
      </div>
    </div>
  );
}
