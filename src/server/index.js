const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
const port = 3001 // Đảm bảo cổng này không trùng với cổng của React app

app.use(cors())

app.get('/proxy-epub', async (req, res) => {
  const epubUrl = req.query.url

  if (!epubUrl) {
    return res.status(400).send('No URL provided')
  }

  try {
    const response = await axios.get(epubUrl, {
      responseType: 'arraybuffer',
    })

    res.setHeader('Content-Type', 'application/epub+zip')
    res.setHeader('Content-Disposition', 'attachment; filename="book.epub"')
    res.send(response.data)
  } catch (error) {
    console.error('Error fetching EPUB:', error)
    res.status(500).send('Error fetching EPUB')
  }
})

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`)
})
