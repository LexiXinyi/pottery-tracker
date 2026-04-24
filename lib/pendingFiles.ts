let pending: File[] = [];

export function setPendingFiles(files: File[]) {
  pending = files;
}

export function takePendingFiles(): File[] {
  const out = pending;
  pending = [];
  return out;
}
