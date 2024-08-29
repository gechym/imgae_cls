const express = require('express')
const multer = require('multer')
const jpeg = require('jpeg-js')
const sharp = require('sharp');
const path = require('path')

const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')

const cors = require('cors');



const convert = async (img) => {
    // Kiểm tra nếu định dạng là JPEG
    const jpegMagicNumbers = [0xFF, 0xD8, 0xFF]; // SOI marker
    const isJpeg = jpegMagicNumbers.every((byte, index) => img[index] === byte);
    
    let processedImage;
  
    if (isJpeg) {
      // Nếu là JPEG, giải mã như trước
      processedImage = await jpeg.decode(img, true);
    } else {
      // Nếu không phải JPEG, chuyển đổi sang JPEG
      processedImage = await sharp(img).jpeg().toBuffer();
      processedImage = await jpeg.decode(processedImage, true);
    }
  
    const numChannels = 3;
    const numPixels = processedImage.width * processedImage.height;
    const values = new Int32Array(numPixels * numChannels);
  
    for (let i = 0; i < numPixels; i++)
      for (let c = 0; c < numChannels; ++c)
        values[i * numChannels + c] = processedImage.data[i * 4 + c];
  
    return tf.tensor3d(values, [processedImage.height, processedImage.width, numChannels], 'int32');
};

const app = express()
const upload = multer()

app.use(cors());

let _model

const htmlFilePath = path.join(__dirname,'index.html');

// Endpoint trả về file HTML
app.get('/', (req, res) => {
  res.sendFile(htmlFilePath);
});

app.post('/cls-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('Missing image multipart/form-data');
  } else {
    try {
      const image = await convert(req.file.buffer);
      const predictions = await _model.classify(image);
      image.dispose();
      res.status(200).json({
        label : predictions[0].className === "Neutral" ? 0 : 1,
        status : 200
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

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(3000, '', () => {
    console.log('Server is running on http://:3000');
}));