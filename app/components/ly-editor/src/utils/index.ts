import { getNoteDetail } from "@/apis/note";
import { lyEditorEmitter } from "@/events";
import dayjs from "dayjs";

export function getEditorFilePath(options: { name: string; folder?: number | string }): string {
  if (options.folder) {
    return `/${options.folder}${options.name}`;
  } else {
    return `/${options.name}`;
  }
}

export async function openEditorNoteFile(id: number) {
  const note = await getNoteDetail(id);

  const path = getEditorFilePath({
    name: note.name,
    folder: note.folder_id
  });

  lyEditorEmitter.emit("cmd.editor-core:open:file", {
    key: path,
    label: `${note.name}${note.extension ?? ""}`,
    isChange: false,
    openTime: dayjs().unix(),
    type: "note",
    data: {
      id: note.id,
      folder_id: note.folder_id,
      name: note.name,
      content: note.content
    }
  });
}
