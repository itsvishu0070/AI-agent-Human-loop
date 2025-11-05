Frondesk Assignment – AI Agent Human Loop


Tech Stack

Backend: Node.js, Express.js, MongoDB (Mongoose), LiveKit (voice/video API)

Frontend: React, Vite, JavaScript, CSS

Other: REST API, browser SpeechSynthesis (AI voice), LiveKit SDK

Dev Tools: npm, dotenv, ESLint



Prerequisites

Node.js (v18+ recommended)

npm (comes with Node.js)

MongoDB (local or cloud, e.g. MongoDB Atlas)

Backend Setup
Install dependencies: cd backend
                      npm install

Configure environment variables:
Create a .env file in the backend folder:    

MONGO_URI=mongodb://localhost:27017/frondesk

PORT=5000

LIVEKIT_API_KEY=your_livekit_api_key

LIVEKIT_API_SECRET=your_livekit_api_secret

LIVEKIT_URL=https://your-livekit-server-url             


Start the backend server: npm start


Frontend Setup
Install dependencies: cd frontend
                      npm install

Configure environment variables:
Create a .env file in the frontend folder: VITE_API_URL=http://localhost:5000

Start the frontend dev server: npm run dev




                      
