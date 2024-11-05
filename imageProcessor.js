const jpeg = require('jpeg-js');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');

const convertImageToTensor = async (img) => {
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

const classifyImage = async (model, imageBuffer) => {
  const image = await convertImageToTensor(imageBuffer);
  const predictions = await model.classify(image);
  image.dispose();
  return predictions;
};

module.exports = {
  convertImageToTensor,
  classifyImage
};
