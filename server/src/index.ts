import 'dotenv/config';

import app from './app';

const PORT = Number.parseInt(process.env.PORT ?? '', 10) || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
