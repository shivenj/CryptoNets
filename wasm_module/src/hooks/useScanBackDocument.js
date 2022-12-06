import { useState } from "react";
import { isValidPhotoID } from "@privateid/cryptonets-web-sdk-alpha";
import { CANVAS_SIZE } from "../utils";

let internalCanvasSize;
const useScanBackDocument = (onSuccess) => {
  const [scanResult, setScanResult] = useState(null);
  const [scannedCodeData, setScannedCodeData] = useState(null);
  const [isFound, setIsFound] = useState(false);

  const documentCallback = (result) => {
    console.log("--------- Back scan callback result:", result);
    console.log("--------- returnedValue:", result.returnValue);
    if (result.status === "WASM_RESPONSE") {
      if(result.returnValue.op_status === 0){
        const { firstName, middleName, lastName, dateOfBirth, gender, streetAddress1, streetAddress2, state, city, postCode, issuingCountry } =
        result.returnValue;
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
        setIsFound(true);
        setScannedCodeData(finalResult);
        return finalResult;
      }
    }
    scanBackDocument();
  };

  const scanBackDocument = async (canvasSize) => {
    if (canvasSize && canvasSize !== internalCanvasSize) {
      internalCanvasSize = canvasSize;
    }
    const canvasObj = canvasSize
      ? CANVAS_SIZE[canvasSize]
      : internalCanvasSize
      ? CANVAS_SIZE[internalCanvasSize]
      : { width: 10240, height: 4320 };
    console.log({ canvasObj });
    const result = await isValidPhotoID("PHOTO_ID_BACK", documentCallback, true, undefined, undefined, canvasObj);
    onSuccess(result);
  };

  return { scanBackDocument, scannedCodeData, scanResult, isFound };
};

export default useScanBackDocument;
