const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
  };
  
  const PATHS = {
    // User paths
    USER: {
      BASE: '/api/users',
      CREATE: { path: '/api/users', method: METHODS.POST },
      READ_ALL: { path: '/api/users', method: METHODS.GET },
      READ_ONE: { path: '/api/users/:id', method: METHODS.GET },
      UPDATE: { path: '/api/users/:id', method: METHODS.PUT },
      DELETE: { path: '/api/users/:id', method: METHODS.DELETE },
    },
    
    // Feedback paths
    FEEDBACK: {
      BASE: '/api/feedbacks',
      CREATE: { path: '/api/feedbacks', method: METHODS.POST },
      READ_ALL: { path: '/api/feedbacks', method: METHODS.GET },
      READ_ONE: { path: '/api/feedbacks/:id', method: METHODS.GET },
      UPDATE: { path: '/api/feedbacks/:id', method: METHODS.PUT },
      DELETE: { path: '/api/feedbacks/:id', method: METHODS.DELETE },
    },
    
    // Report paths
    REPORT: {
      BASE: '/api/reports',
      CREATE: { path: '/api/reports', method: METHODS.POST },
      READ_ALL: { path: '/api/reports', method: METHODS.GET },
      READ_ONE: { path: '/api/reports/:id', method: METHODS.GET },
      UPDATE: { path: '/api/reports/:id', method: METHODS.PUT },
      DELETE: { path: '/api/reports/:id', method: METHODS.DELETE },
    },
    
    // Notification paths
    NOTIFICATION: {
      BASE: '/api/notifications',
      CREATE: { path: '/api/notifications', method: METHODS.POST },
      READ_ALL: { path: '/api/notifications', method: METHODS.GET },
      READ_ONE: { path: '/api/notifications/:id', method: METHODS.GET },
      UPDATE: { path: '/api/notifications/:id', method: METHODS.PUT },
      DELETE: { path: '/api/notifications/:id', method: METHODS.DELETE },
    },
    
    // Comment paths
    COMMENT: {
      BASE: '/api/comments',
      CREATE: { path: '/api/comments', method: METHODS.POST },
      READ_ALL: { path: '/api/comments', method: METHODS.GET },
      READ_ONE: { path: '/api/comments/:id', method: METHODS.GET },
      UPDATE: { path: '/api/comments/:id', method: METHODS.PUT },
      DELETE: { path: '/api/comments/:id', method: METHODS.DELETE },
    },
    
    // ALPR paths
    ALPR: {
      BASE: '/api/alprs',
      CREATE: { path: '/api/alprs', method: METHODS.POST },
      READ_ALL: { path: '/api/alprs', method: METHODS.GET },
      READ_ONE: { path: '/api/alprs/:id', method: METHODS.GET },
      UPDATE: { path: '/api/alprs/:id', method: METHODS.PUT },
      DELETE: { path: '/api/alprs/:id', method: METHODS.DELETE },
    },
    
    // Chat paths
    CHAT: {
      BASE: '/api/chats',
      CREATE: { path: '/api/chats', method: METHODS.POST },
      READ_ALL: { path: '/api/chats', method: METHODS.GET },
      READ_ONE: { path: '/api/chats/:id', method: METHODS.GET },
      UPDATE: { path: '/api/chats/:id', method: METHODS.PUT },
      DELETE: { path: '/api/chats/:id', method: METHODS.DELETE },
    },
    
    // Message paths
    MESSAGE: {
      BASE: '/api/messages',
      CREATE: { path: '/api/messages', method: METHODS.POST },
      READ_ALL: { path: '/api/messages', method: METHODS.GET },
      READ_ONE: { path: '/api/messages/:id', method: METHODS.GET },
      UPDATE: { path: '/api/messages/:id', method: METHODS.PUT },
      DELETE: { path: '/api/messages/:id', method: METHODS.DELETE },
    },
  };
  
  module.exports = { PATHS, METHODS };