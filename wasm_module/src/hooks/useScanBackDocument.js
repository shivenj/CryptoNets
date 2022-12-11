import { useEffect, useState } from "react";
import { convertCroppedImage, isValidPhotoID } from "@privateid/cryptonets-web-sdk-alpha";
import { CANVAS_SIZE } from "../utils";

let internalCanvasSize;
const useScanBackDocument = (onSuccess) => {
  const [scanResult, setScanResult] = useState(null);
  const [scannedCodeData, setScannedCodeData] = useState(null);
  const [isFound, setIsFound] = useState(false);

  const [croppedDocumentImageData, setCroppedDocumentImageData] = useState(null);
  const [croppedDocumentWidth, setCropedDocumentWidth] = useState(null);
  const [croppedDocumentHeight, setCroppedDocumentHeight] = useState(null);

  const [croppedBarcodeImageData, setCroppedBarcodeImageData] = useState(null);
  const [croppedBarcodeWidth, setCroppedBarcodeWidth] = useState(null);
  const [croppedBarcodeHeight, setCroppedBarcodeHeight] = useState(null);


  const [croppedDocumentImage, setCroppedDocumentImage] = useState(null);
  const [croppedBarcodeImage, setCroppedBarcodeImage] = useState(null);

  const documentCallback = (result) => {
    console.log("--------- Back scan callback result:", result);
    console.log("--------- returnedValue:", result.returnValue);
    if (result.status === "WASM_RESPONSE") {
      if (result.returnValue.op_status === 0) {
        const {
          firstName,
          middleName,
          lastName,
          dateOfBirth,
          gender,
          streetAddress1,
          streetAddress2,
          state,
          city,
          postCode,
          issuingCountry,
          crop_doc_width,
          crop_doc_height,
          crop_barcode_width,
          crop_barcode_height,
        } = result.returnValue;
        const finalResult = {
          firstName,
          middleName,
          lastName,
          dateOfBirth,
          gender,
          streetAddress1,
          streetAddress2,
          state,
          city,
          postCode,
          issuingCountry,
        };
        setCropedDocumentWidth(crop_doc_width);
        setCroppedDocumentHeight(crop_doc_height);
        setCroppedBarcodeWidth(crop_barcode_width);
        setCroppedBarcodeHeight(crop_barcode_height);
        setIsFound(true);
        setScannedCodeData(finalResult);
        return finalResult;
      } else {
        setCropedDocumentWidth(null);
        setCroppedDocumentHeight(null);
        setCroppedBarcodeWidth(null);
        setCroppedBarcodeHeight(null);
      }
    }
    setCroppedDocumentImageData(null);
    setCroppedBarcodeImageData(null)
    scanBackDocument();
  };

  const convertImageData = async (imageData, width, height, setState) => {
    const convertedImage = await convertCroppedImage(imageData, width, height);
    setState(convertedImage);
  };

  useEffect(() => {
    if (isFound && croppedDocumentImageData && croppedDocumentWidth && croppedDocumentHeight) {
      convertImageData(croppedDocumentImageData,croppedDocumentWidth,croppedDocumentHeight,setCroppedDocumentImage);
    }
  }, [isFound, croppedDocumentImageData, croppedDocumentWidth, croppedDocumentHeight]);

  useEffect(() => {
    if (isFound && croppedBarcodeImageData && croppedBarcodeWidth && croppedBarcodeHeight) {
      convertImageData(croppedBarcodeImageData,croppedBarcodeWidth,croppedBarcodeHeight,setCroppedBarcodeImage);
    }
  }, [isFound, croppedBarcodeImageData, croppedBarcodeWidth, croppedBarcodeHeight]);


  useEffect(() => {
    if(croppedDocumentImage && croppedBarcodeImage){
      console.log("Barcode Images:", {croppedBarcodeImage, croppedDocumentImage});
    }
  }, [croppedDocumentImage, croppedBarcodeImage])

  const scanBackDocument = async (canvasSize) => {
    if (canvasSize && canvasSize !== internalCanvasSize) {
      internalCanvasSize = canvasSize;
    }
    const canvasObj = canvasSize
      ? CANVAS_SIZE[canvasSize]
      : internalCanvasSize
      ? CANVAS_SIZE[internalCanvasSize]
      : {};
    const {result, croppedBarcode, croppedDocument} = await isValidPhotoID("PHOTO_ID_BACK", documentCallback, true, undefined, undefined, canvasObj);
    if (result === 0) {
      setCroppedDocumentImageData(croppedDocument);
      setCroppedBarcodeImageData(croppedBarcode);
    } else {
      setCroppedDocumentImageData(null);
      setCroppedBarcodeImageData(null);
    }
    onSuccess({result, croppedBarcode, croppedDocument});
  };

  return { scanBackDocument, scannedCodeData, scanResult, isFound, croppedDocumentImage, croppedBarcodeImage };
};

export default useScanBackDocument;
