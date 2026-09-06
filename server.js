const express = require('express');
const app = express();

app.use(express.json());

// Sesuaikan path jika auth.js ada di dalam folder routes (misal: './routes/auth')
const auth = require('./auth'); 

// app.use() sekarang menerima router express dengan aman
app.use('/auth', auth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
