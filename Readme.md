# Todo List App

This is a simple Node.js application for managing a Todo list. It uses Express for the backend, MongoDB for data storage, and includes JWT-based authentication.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

1.Install dependencies:
    npm install

2.Set up MongoDB:
    Create a MongoDB database and obtain the connection URI.

    Update the MongoDB connection URI in index.js:

    await mongoose.connect("your-mongodb-connection-uri");

3.Run the application:
    npm start

