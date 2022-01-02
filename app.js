require('dotenv').config();
const multer = require('multer');
const express = require('express');
const path = require('path');
const uniqid = require('uniqid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/files', express.static('files'));
app.use((req, res, next) => {
  const key = req.body.key || req.query.key;
  if (key !== process.env.API_KEY) res.status(401).send();
  else next();
});

const handleUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'files');
    },
    filename: (req, file, cb) => {
      const extname = path.extname(file.originalname).toLowerCase();
      const name = file.originalname.replace(extname, '');
      cb(null, `${name}-${uniqid()}${extname}`);
    },
  }),
});

app.post('/files', handleUpload.array('files'), (req, res) => {
  if (!req.files.length)
    return res
      .status(422)
      .send('You should send at least one file in a "files" field');
  res.send(
    req.files.map((file) => ({
      url: req.protocol + '://' + req.headers.host + '/' + file.path,
    }))
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
