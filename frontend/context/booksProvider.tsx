import React, { createContext, useState, useEffect } from "react"
import { Book } from "../@types/book";
import { Borrowing } from "../@types/borrowing";
import { api } from "../api"

const defaultBorrowingDuration = 0
const defaultFinePerDay = 1.0

type Props = {
  children: JSX.Element;
};

interface ValueTypes {
  books?: Book[];
  borrowedBooks?: Book[];
  addBooks: (books: Book[]) => void
  addBook: (newBook: Book) => Promise<void>
  borrowBook: (bookId: number) =>  Promise<void>
}

const defaultObject: ValueTypes = {
  books: [],
  borrowedBooks: [],
  addBooks: (_: Book[]) => {},
  addBook: async (_: Book) =>  {},
  borrowBook: async (_: number) =>  {}
}

export const BooksContext = createContext<ValueTypes>(defaultObject)

export const BooksProvider: React.FC<Props> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([])

  const checkIsBorrowed = (book: Book, borrowings: Borrowing[]) => {
    for (const borrowing of borrowings) {
      if (book.id === borrowing.book_id) return true
    }
    return false
  }

  const getBooks = async (): Promise<Book[]> => {
    const token = localStorage.getItem('token')
    const response = await api.get('books', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data
  }

  const getBookBorrowings = async (): Promise<Borrowing[]> => {
    const token = localStorage.getItem('token')
    const responseBorrowings = await api.get('user/myBorrowings', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return responseBorrowings.data
  }

  const addBooks = (books: Book[]) => {
    setBooks(books)
  }

  const addBook = async (newBook: Book): Promise<void> => {
    const token = localStorage.getItem('token')
    await api.post('books', newBook, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setBooks([...books, newBook])
  }

  const borrowBook = async (bookId: number) => {
    const token = localStorage.getItem('token')
    const data = {
      borrowingDuration: defaultBorrowingDuration,
      finePerDay: defaultFinePerDay,
      bookId
    }

    await api.post('book-borrowing', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log(`Book ${bookId} borrowed!`)

    const books = await getBooks()
    const borrowings = await getBookBorrowings()
    const notBorrowedBooks = books.filter(book => !checkIsBorrowed(book, borrowings))
    const borrowedBooks = books.filter(book => checkIsBorrowed(book, borrowings))
    setBooks(notBorrowedBooks) 
    setBorrowedBooks(borrowedBooks)
  }

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getBooks()
        const borrowings = await getBookBorrowings()
        const notBorrowedBooks = books.filter(book => !checkIsBorrowed(book, borrowings))
        const borrowedBooks = books.filter(book => checkIsBorrowed(book, borrowings))
        setBooks(notBorrowedBooks) 
        setBorrowedBooks(borrowedBooks)
      } catch (err) {
        console.log("Error")
      }
    }

    fetchBooks()
  }, [])

  return (
    <BooksContext.Provider value={{ books, addBooks, addBook, borrowBook, borrowedBooks }}>
      {children}
    </BooksContext.Provider>
  )
}
