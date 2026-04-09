export type BookStatus = "to_read" | "reading" | "done";

export type Book = {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status: BookStatus;
  rating?: number; // 1 à 5 étoiles
  note?: string;
  startedAt?: string;
  finishedAt?: string;
  pageCount?: number;
  genre?: string;
};

export type GoogleBookVolume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    categories?: string[];
    description?: string;
    publishedDate?: string;
  };
};

export type GoogleBooksResponse = {
  totalItems: number;
  items?: GoogleBookVolume[];
};

export const STATUS_LABELS: Record<BookStatus, string> = {
  to_read: "À lire",
  reading: "En cours",
  done: "Terminé",
};

export const STATUS_COLORS: Record<BookStatus, string> = {
  to_read: "bg-zinc-600",
  reading: "bg-indigo-600",
  done: "bg-violet-600",
};
