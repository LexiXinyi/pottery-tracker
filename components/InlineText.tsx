'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string | null;
  placeholder: string;
  onSave: (value: string) => Promise<void> | void;
  multiline?: boolean;
  className?: string;
  emptyClassName?: string;
}

export default function InlineText({
  value,
  placeholder,
  onSave,
  multiline = false,
  className = '',
  emptyClassName = '',
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editing]);

  async function commit() {
    const next = draft.trim();
    if (next === (value ?? '')) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(next);
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setDraft(value ?? '');
    setEditing(false);
  }

  if (editing) {
    const commonProps = {
      ref: inputRef as never,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      },
      disabled: saving,
      placeholder,
      className: `${className} bg-white border border-stone-300 rounded-md px-2 py-1 outline-none focus:border-stone-800 w-full`,
    };

    return multiline ? (
      <textarea rows={3} {...commonProps} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  const isEmpty = !value;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`${className} ${isEmpty ? emptyClassName : ''} text-left w-full hover:bg-stone-100 rounded-md px-2 py-1 -mx-2 transition-colors cursor-text`}
    >
      {isEmpty ? placeholder : value}
    </button>
  );
}
