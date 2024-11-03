import React, { useRef, useState, useEffect } from 'react'
import { Input, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import style from './Chat.module.css'

export default function Chat({ socket }) {
  const bottomRef = useRef()
  const messageRef = useRef()
  const [messageList, setMessageList] = useState([])

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessageList((current) => [...current, data])
    })

    return () => socket.off('receive_message')
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

  return (
    <div>
      <div className={style['chat-container']}>
        <div className={style['chat-body']}>
          {
            messageList.map((message, index) => (
              <div
                className={`${style['message-container']} ${message.authorId === socket.id && style['message-mine']}`}
                key={index}
              >
                <div className="message-author"><strong>{message.author}</strong></div>
                {
                  message.type === 'text' ?
                    <div className="message-text">{message.text}</div> :
                    <img src={message.image} alt="enviada pelo usuario" className={style['message-image']} />
                }
              </div>
            ))
          }
          <div ref={bottomRef} />
        </div>
        <div className={style['chat-footer']}>
          <Input inputRef={messageRef} placeholder='Mensagem' onKeyDown={(e) => getEnterKey(e)} fullWidth />
          <IconButton component="label">
            <ImageIcon color="primary" />
            <input type="file" hidden onChange={handleImageUpload} />
          </IconButton>
          <SendIcon sx={{ m: 1, cursor: 'pointer' }} onClick={() => handleSubmit()} color="primary" />
        </div>
      </div>
    </div>
  )
}
