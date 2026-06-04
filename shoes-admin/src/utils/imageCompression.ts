export const IMAGE_TARGET_BYTES = 500 * 1024;
export const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIDE_SEQUENCE = [2400, 2200, 2000, 1800, 1600, 1400, 1200, 1000, 900, 800, 700, 640] as const;
const MAX_WEBP_QUALITY = 0.96;
const MIN_WEBP_QUALITY = 0.72;
const QUALITY_SEARCH_STEPS = 8;

type ImageLike = Pick<File, 'size' | 'type'>;

export type PreparedImage = {
  file: File;
  compressed: boolean;
};

export function shouldCompressImage(file: ImageLike) {
  return file.size > IMAGE_TARGET_BYTES;
}

const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('图片读取失败'));
  };
  image.src = objectUrl;
});

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
      return;
    }
    reject(new Error('图片压缩失败'));
  }, type, quality);
});

const drawImageToCanvas = (image: HTMLImageElement, maxSide: number) => {
  const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('浏览器不支持图片压缩');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas;
};

async function findBestWebpBlob(canvas: HTMLCanvasElement) {
  let low = MIN_WEBP_QUALITY;
  let high = MAX_WEBP_QUALITY;
  let bestUnderTarget: Blob | null = null;
  let smallestBlob = await canvasToBlob(canvas, 'image/webp', MIN_WEBP_QUALITY);

  for (let index = 0; index < QUALITY_SEARCH_STEPS; index += 1) {
    const quality = (low + high) / 2;
    const blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (blob.size < smallestBlob.size) {
      smallestBlob = blob;
    }

    if (blob.size <= IMAGE_TARGET_BYTES) {
      bestUnderTarget = blob;
      low = quality;
    } else {
      high = quality;
    }
  }

  return bestUnderTarget || (smallestBlob.size <= IMAGE_TARGET_BYTES ? smallestBlob : null);
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  if (!shouldCompressImage(file)) {
    return { file, compressed: false };
  }

  const image = await loadImage(file);
  let lastBlob: Blob | null = null;

  for (const maxSide of MAX_IMAGE_SIDE_SEQUENCE) {
    const canvas = drawImageToCanvas(image, maxSide);
    const blob = await findBestWebpBlob(canvas);
    if (blob) {
      const filename = file.name.replace(/\.[^.]+$/, '') || 'product-image';
      return {
        file: new File([blob], `${filename}.webp`, { type: 'image/webp' }),
        compressed: true,
      };
    }
    lastBlob = await canvasToBlob(canvas, 'image/webp', MIN_WEBP_QUALITY);
  }

  const filename = file.name.replace(/\.[^.]+$/, '') || 'product-image';
  return {
    file: new File([lastBlob || file], `${filename}.webp`, { type: 'image/webp' }),
    compressed: true,
  };
}
