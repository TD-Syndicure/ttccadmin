/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} imageSrc - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */

 const createImage = (url) =>
 new Promise((resolve, reject) => {
     const image = new Image();
     image.addEventListener("load", () => resolve(image));
     image.addEventListener("error", (error) => reject(error));
     image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
     image.src = url;
 });

export default async function getCroppedImg(imageSrc) {

 const allCreatedImages = []
 const canvas = document.createElement("canvas");
 const ctx = canvas.getContext("2d");
 canvas.width = 2048
 canvas.height = 2048
 for (const image of imageSrc) {
     const createdImage = await createImage(image)
     allCreatedImages.push(createdImage)
     ctx.drawImage(
         createdImage, 0, 0, canvas.width, canvas.height
     )
 }

 const data = ctx.getImageData(0, 0, 2048, 2048);

 ctx.putImageData(
     data, 0, 0
 );

 // As Base64 string
 // return canvas.toDataURL("image/jpeg");
 return canvas;
}

export const generateDownload = async (imageSrc) => {
 if (!imageSrc) {
     return;
 }

 const canvas = await getCroppedImg(imageSrc);
 
 return canvas.toDataURL()
};
