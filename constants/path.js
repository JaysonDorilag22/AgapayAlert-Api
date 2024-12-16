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
    CREATE: { path: "/create", method: METHODS.POST },
    READ_ALL: { path: "/", method: METHODS.GET },
    READ_ONE: { path: "/:id", method: METHODS.GET },
    READ_RATINGS: { path: "/overall-ratings", method: METHODS.GET },
    USER_FEEDBACKS: { path: "/user/:userId", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/delete/:id", method: METHODS.DELETE },
},

  // Report paths
  REPORT: {
    BASE: "/api/reports",
    CREATE: { path: "/create", method: METHODS.POST },
    READ_ALL: { path: "/getall", method: METHODS.GET },
    READ_ONE: { path: "/getone/:id", method: METHODS.GET },
    UPDATE: { path: "/:id", method: METHODS.PUT },
    DELETE: { path: "/:id", method: METHODS.DELETE },
    POST_REPORT: { path: "/:id", method: METHODS.POST },
    DELETE_POST: { path: "/:id", method: METHODS.DELETE },
    UPDATE_STATUS: { path: "/status/:id", method: METHODS.PUT },
    READ_BY_USER: { path: '/byuser', method: METHODS.GET },

  },

  // Notification paths
  NOTIFICATION: {
    BASE: "/api/notifications",
    CREATE: { path: "/create", method: METHODS.POST },
    SMS: { path: "/sms", method: METHODS.POST },
    TEST_SMS: {path: "/test-sms", method: METHODS.POST},
    EMAIL: { path: "/email", method: METHODS.POST },
    READ_ALL: { path: "/getAll", method: METHODS.GET },
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
    READ_ALL: { path: "/:id", method: METHODS.GET },
    RECOGNIZE: { path: "/recognize", method: METHODS.POST },
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

  // Sighting paths
  SIGHTING: {
    BASE: "/api/sightings",
    CREATE: { path: "/create", method: METHODS.POST },
    READ_ALL: { path: "/getall", method: METHODS.GET },
    READ_ONE: { path: "/getone/:id", method: METHODS.GET },
    UPDATE: { path: "/update/:id", method: METHODS.PUT },
    DELETE: { path: "/delete/:id", method: METHODS.DELETE },
    READ_BY_USER: { path: '/byuser', method: METHODS.GET },
  },

};

module.exports = { PATHS, METHODS };
