const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

const PATHS = {
  // User paths
  AUTH: {
    BASE: "/api/auth",
    CREATE: { path: "/signup", method: METHODS.POST },
    LOGIN: { path: "/login", method: METHODS.POST },
    LOGOUT: { path: "/logout", method: METHODS.POST },
    VERIFY: { path: "/verify", method: METHODS.POST },
    RESEND: { path: "/resend-verification", method: METHODS.POST },
    FORGOT_PASSWORD: { path: "/request-password-reset", method: METHODS.POST },
    RESET_PASSWORD: { path: "/reset-password", method: METHODS.POST },
  },
  // User paths
  USER: {
    BASE: "/api/users",
    CREATE: { path: "/", method: METHODS.POST },
    LOGIN: { path: "/login", method: METHODS.POST },
    LOGOUT: { path: "/logout", method: METHODS.POST },
    VERIFY: { path: "/verify", method: METHODS.POST },
    RESEND: { path: "/resend-verification", method: METHODS.POST },
    FORGOT_PASSWORD: { path: "/request-password-reset", method: METHODS.POST },
    RESET_PASSWORD: { path: "/reset-password", method: METHODS.POST },
    READ_ALL_PAGINATION: { path: "/?page=1&pageSize=10", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // Feedback paths
  FEEDBACK: {
    BASE: "/api/feedbacks",
    CREATE: { path: "/", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // Report paths
  REPORT: {
    BASE: "/api/reports",
    CREATE: { path: "/create", method: METHODS.POST },
    READ_ALL: { path: "/getall", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
    POST_REPORT: { path: "/:id", method: METHODS.POST },
    DELETE_POST: { path: "/:id", method: METHODS.DELETE },


  },

  // Notification paths
  NOTIFICATION: {
    BASE: "/api/notifications",
    CREATE: { path: "/create", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // Comment paths
  COMMENT: {
    BASE: "/api/comments",
    CREATE: { path: "/", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // ALPR paths
  ALPR: {
    BASE: "/api/alprs",
    CREATE: { path: "/", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // Chat paths
  CHAT: {
    BASE: "/api/chats",
    CREATE: { path: "/", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

  // Message paths
  MESSAGE: {
    BASE: "/api/messages",
    CREATE: { path: "/", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
  },

};

module.exports = { PATHS, METHODS };
