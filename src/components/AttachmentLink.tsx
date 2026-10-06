import { Paperclip } from 'lucide-react';
import { openMockAttachment } from '../utils/attachments';

interface Props {
  fileName: string;
  title: string;
  lines: string[];
  fileUrl?: string; // Will be provided by the real backend later
}

export function AttachmentLink({ fileName, title, lines, fileUrl }: Props) {
  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
        <Paperclip size={12} /> {fileName}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openMockAttachment(fileName, title, lines)}
      title="Preview attachment"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      <Paperclip size={12} /> {fileName}
    </button>
  );
}