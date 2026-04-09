import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book, BookStatus } from "../types";

interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  getBooksByStatus: (status: BookStatus) => Book[];
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: [],

      addBook: (book) =>
        set((state) => ({ books: [book, ...state.books] })),

      updateBook: (id, updates) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      removeBook: (id) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
        })),

      getBook: (id) => get().books.find((b) => b.id === id),

      getBooksByStatus: (status) =>
        get().books.filter((b) => b.status === status),
    }),
    {
      name: "myreads-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
