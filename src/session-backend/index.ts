import { Server, type Socket } from 'socket.io'
import type { Shape } from '../types'

const io = new Server(8080, { cors: { origin: '*' } })

const shapes: Shape[] = []
const users: Set<{ id: string; socket: Socket }> = new Set()
io.on('connection', (socket: Socket) => {
  logUserInteraction()
  console.log('New user connected:', socket.id)
  socket.emit('snapshot', shapes)
  const newUser = { id: socket.id, socket }
  users.add(newUser)

  // send all existing users a 'user-entered' event for the new user
  socket.broadcast.emit('user-entered', newUser.id)

  // send the new user a 'user-entered' event for each existing user
  for (const user of users) {
    newUser.socket.emit('user-entered', user.id)
  }

  socket.on('cursor-position', ({ x, y }) => {
    socket.volatile.broadcast.emit('cursor-position', { id: socket.id, cursorX: x, cursorY: y })
    logUserInteraction()
  })

  socket.on('create-shape', (shape) => {
    shapes.push(shape)
    socket.broadcast.emit('snapshot', shapes)
    logUserInteraction()
  })

  socket.on('update-shape', (updatedShape) => {
    const shape = shapes.find(s => s.id === updatedShape.id)
    if (!shape) return
    shape.x = updatedShape.x
    shape.y = updatedShape.y
    shape.w = updatedShape.w
    shape.h = updatedShape.h
    socket.broadcast.emit('update-shape', shape)
    logUserInteraction()
  })

  socket.on('disconnect', () => {
    users.delete(newUser)
    socket.broadcast.emit('user-exited', newUser.id)
    console.log('User disconnected:', socket.id, 'Remaining users:', users.size)
  })
})

const logUserInteraction = (function() {
  const IDLE_PERIOD = 5 * 60 * 1000 // 5 minutes
  let wentIdleAt: number | null = Date.now()
  let timeout: NodeJS.Timeout | null = null
  return function () {
    if (wentIdleAt) {
      const inactivity = Math.round((Date.now() - wentIdleAt) / 1000)
      console.log(`User interacted after ${inactivity} seconds of inactivity`)
      wentIdleAt = null
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      wentIdleAt = Date.now()
      console.log(`No interactions for last ${Math.floor(IDLE_PERIOD / 1000)} seconds`)
    }, IDLE_PERIOD)
  }
})()
