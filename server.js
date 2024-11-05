const express = require('express')
const multer = require('multer')
const path = require('path')
const nsfw = require('nsfwjs')
const cors = require('cors');

// Thêm import từ các file mới
const config = require('./config');
const { classifyImage } = require('./imageProcessor');

const app = express()
const upload = multer()

app.use(cors());

let _model

const htmlFilePath = path.join(__dirname,'index.html');
const contentFilter = path.join(__dirname,'ui_contet_filter.html');

// Endpoint trả về file HTML
app.get('/', (req, res) => {
  res.sendFile(htmlFilePath);
});

app.post('/cls-image', upload.array('images', config.MAX_UPLOAD_FILES), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400).send('Missing images multipart/form-data');
  } else {
    try {
      const results = [];
      for (const file of req.files) {
        // Sử dụng hàm classifyImage từ imageProcessor.js
        const predictions = await classifyImage(_model, file.buffer);
        results.push({
          filename: file.originalname.split('.')[0],
          label: 
            predictions[0].className === "Neutral" || 
            predictions[0].className === "Drawing" ? 0 : 1,
          result: predictions
        });
      }
      res.status(200).json({
        results: results,
        status: 200
      });
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
});

const load_model = async () => {
  _model = await nsfw.load()
}

// Sử dụng cấu hình từ config.js
load_model().then(() => app.listen(config.PORT, config.HOST, () => {
    console.log(`Server is running on http://${config.HOST}:${config.PORT}`);
}));