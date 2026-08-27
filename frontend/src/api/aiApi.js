import axios from 'axios';

const aiApi = axios.create({
  baseURL: 'https://comfortable-generosity-production-2b4f.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default aiApi;