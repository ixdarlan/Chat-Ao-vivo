const app = require('express')()
const server = require('http').createServer(app)
const bodyParser = require('body-parser');
const securityRoutes = require('./security');
const io = require('socket.io')(server, {cors: {origin: 'http://localhost:5173'}})

app.use(bodyParser.json());
app.use('/api', securityRoutes);

const PORT = process.env.PORT || 5000;

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

  socket.on('audio', audioData => {
    io.emit('receive_audio', {
      audio: audioData,
      authorId: socket.id,
      author: socket.data.username,
    });
  });

  socket.on('send_image', (imageBuffer) => {
    io.emit('receive_message', {
      type: 'image',
      image: imageBuffer,
      authorId: socket.id,
      author: socket.data.username
    })
  })
})

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))