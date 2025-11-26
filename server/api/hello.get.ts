export default defineEventHandler(() => {
  return {
    message: 'Hello World!',
    success: true,
    timestamp: new Date().toISOString()
  }
})
