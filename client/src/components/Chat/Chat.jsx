import React, { useRef, useState, useEffect } from 'react'
import { Input, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import MicIcon from '@mui/icons-material/Mic';
import style from './Chat.module.css'

export default function Chat({ socket }) {
  const bottomRef = useRef()
  const messageRef = useRef()
  const [messageList, setMessageList] = useState([])
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessageList((current) => [...current, data])
    })

    socket.on('receive_audio', data => {
      setMessageList(current => [...current, data]);
    });

    return () => {
    	socket.off('receive_message')
    	socket.off('receive_audio');
    	}
  }, [socket])

  useEffect(() => {
    scrollDown()
  }, [messageList])

  const handleSubmit = () => {
    const message = messageRef.current.value
    if (!message.trim()) return

    socket.emit('message', message)
    clearInput()
    focusInput()
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageBuffer = reader.result
      socket.emit('send_image', imageBuffer)
    }
    reader.readAsDataURL(file)
  }

  const clearInput = () => {
    messageRef.current.value = ''
  }

  const focusInput = () => {
    messageRef.current.focus()
  }

  const getEnterKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const scrollDown = () => {
    bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }
  
  const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => {
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        socket.emit('audio', audioUrl); // Enviar o audio para o servidor
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <div className={style['chat-container']}>
        <div className={style["chat-body"]}>
          {messageList.map((message, index) => (
            <div className={`${style["message-container"]} ${message.authorId === socket.id && style["message-mine"]}`} key={index}>
              {message.audio ? (
                <audio controls src={message.audio} />
              ) : message.image ? (
                <img className={style["message-image"]} src={message.image} alt="Sent" />
              ) : (
                <>
                  <div className="message-author"><strong>{message.author}</strong></div>
                  <div className="message-text">{message.text}</div>
                </>
              )}
            </div>
          ))}          <div ref={bottomRef} />
        </div>
        <div className={style['chat-footer']}>
          <Input inputRef={messageRef} placeholder='Mensagem' onKeyDown={(e) => getEnterKey(e)} fullWidth />
          <IconButton component="label">
            <ImageIcon color="primary" />
            <input type="file" hidden onChange={handleImageUpload} />
          </IconButton>
          <SendIcon sx={{ m: 1, cursor: 'pointer' }} onClick={() => handleSubmit()} color="primary" />
          <MicIcon sx={{ m: 1, cursor: 'pointer' }} onClick={isRecording ? stopRecording : startRecording} color="primary" />
        </div>
      </div>
    </div>
  )
}

