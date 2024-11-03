const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {cors: {origin: 'http://localhost:5173'}})

const PORT = 5000

io.on('connection', socket => {
  console.log('Usuario conectado!', socket.id);

  socket.on('disconnect', reason => {
    console.log('Usuario desconectado!', socket.id)
  })

  socket.on('set_username', username => {
    socket.data.username = username
  })

  socket.on('message', text => {
    io.emit('receive_message', {
      type: 'text',
      text,
      authorId: socket.id,
      author: socket.data.username
    })
  })

  // Novo evento para receber e retransmitir a imagem
  socket.on('send_image', (imageBuffer) => {
    io.emit('receive_message', {
      type: 'image',
      image: imageBuffer,
      authorId: socket.id,
      author: socket.data.username
    })
  })
})

server.listen(PORT, () => console.log('Server running...'))
