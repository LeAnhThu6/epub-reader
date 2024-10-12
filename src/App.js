import React, {useState, useRef, useEffect} from 'react'
import {ReactReader} from 'react-reader'
import axios from 'axios'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Divider,
} from '@mui/material'
import {ColorLens} from '@mui/icons-material'
import './App.css'

const colors = ['#FFEB3B', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0']

function App() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [epubUrl, setEpubUrl] = useState(null)
  const [selections, setSelections] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rendition, setRendition] = useState(null)

  useEffect(() => {
    // Fetch books from Gutendex
    axios
      .get('https://gutendex.com/books/')
      .then(response => {
        setBooks(response.data.results)
      })
      .catch(error => {
        console.error('Error fetching books:', error)
        setError('Failed to fetch books. Please try again later.')
      })
  }, [])

  const locationChanged = epubcifi => {
    setLocation(epubcifi)
  }

  const handleBookSelect = book => {
    setSelectedBook(book)
    setLoading(true)
    const epubUrl = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.epub`
    setEpubUrl(epubUrl)
  }

  const handleError = error => {
    console.error('Error in ReactReader:', error)
    setError(
      'An error occurred while loading the book. Please try again later.',
    )
    setLoading(false)
  }

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  useEffect(() => {
    if (rendition) {
      const setRenderSelection = cfiRange => {
        const text = rendition.getRange(cfiRange).toString()
        setSelections(prev => [...prev, {text, cfiRange}])
        rendition.annotations.add('highlight', cfiRange, {
          fill: '#FFEB3B', // Màu mặc định
          fillOpacity: '0.5', // Sử dụng fillOpacity thay vì fill-opacity
        })

        const selection = window.getSelection()
        selection.removeAllRanges()
      }

      rendition.on('selected', setRenderSelection)

      return () => {
        rendition.off('selected', setRenderSelection)
      }
    }
  }, [rendition])

  return (
    <div
      className='App'
      style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' style={{flexGrow: 1}}>
            Project Gutenberg EPUB Reader
          </Typography>
          <Button color='inherit' onClick={handleToggleDrawer}>
            <ColorLens />
            Notes
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{padding: '10px'}}>
        <Select
          onChange={e => handleBookSelect(books[e.target.value])}
          value={selectedBook ? books.indexOf(selectedBook) : ''}
          disabled={loading}
          fullWidth>
          <MenuItem value=''>Select a book</MenuItem>
          {books.map((book, index) => (
            <MenuItem key={book.id} value={index}>
              {book.title} by {book.authors.map(a => a.name).join(', ')}
            </MenuItem>
          ))}
        </Select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {selectedBook && (
        <div style={{flex: 1, position: 'relative'}}>
          <ReactReader
            url={epubUrl}
            title={selectedBook.title}
            location={location}
            locationChanged={locationChanged}
            getRendition={_rendition => {
              setRendition(_rendition)
              _rendition.on('started', () => setLoading(false))
            }}
            handleError={handleError}
          />
        </div>
      )}
      <Drawer anchor='right' open={drawerOpen} onClose={handleToggleDrawer}>
        <div style={{width: 250}}>
          <h2>Selections</h2>
          <ul>
            {selections.map(({text, cfiRange}, i) => (
              <li key={i}>
                <span>{text}</span>
                <button
                  onClick={() => {
                    rendition.display(cfiRange)
                  }}>
                  Show
                </button>
                <button
                  onClick={() => {
                    rendition.annotations.remove(cfiRange, 'highlight')
                    setSelections(selections.filter((_, j) => j !== i))
                  }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </div>
  )
}

export default App
