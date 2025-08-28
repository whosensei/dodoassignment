import axios from 'axios'

const dodo = axios.create({
  baseURL: process.env.DODO_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.DODO_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export default dodo
