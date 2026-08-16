import { getRelatedNotes } from "@/lib/notes/get-related-notes";
import { NoteCard } from "./note-card";
import { PublicNote } from "@/types/note";

interface RelatedNotesProps {
  note: PublicNote;
}

export async function RelatedNotes({ note }: RelatedNotesProps) {
  const related = await getRelatedNotes({
    noteId: note.id,
    subject: note.subject,
    grade: note.grade,
    topic: note.topic,
    tags: note.tags,
    limit: 6,
  });

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-notes-heading" className="mt-10">
      <h2 id="related-notes-heading" className="text-lg font-semibold text-foreground">
        Related notes
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((relatedNote) => (
          <NoteCard key={relatedNote.id} note={relatedNote} />
        ))}
      </div>
    </section>
  );
}
