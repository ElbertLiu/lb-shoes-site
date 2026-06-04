import { MAX_PRODUCT_IMAGES, shouldCompressImage } from './imageCompression';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(!shouldCompressImage({ size: 500 * 1024, type: 'image/jpeg' }), '500KB images should upload without compression');
assert(!shouldCompressImage({ size: 120 * 1024, type: 'image/png' }), 'small images should upload without compression');
assert(shouldCompressImage({ size: 501 * 1024, type: 'image/jpeg' }), 'images above 500KB should be compressed');
assert(MAX_PRODUCT_IMAGES === 5, 'products should allow at most 5 images');

console.log('image compression decisions ok');
