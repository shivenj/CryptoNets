import { useState } from "react";
import { isValid } from "@privateid/cryptonets-web-sdk-alpha";

const useIsValid = (element = "userVideo", deviceId = null) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const isValidCall = async () => {
    // eslint-disable-next-line no-unused-vars
    await isValid(callback);
  };

  const callback = async (result) => {
    console.log("callback hook result isValid:", result);
    switch (result.status) {
      case "WASM_RESPONSE":
        if (result.returnValue.faces.length === 0) {
          setFaceDetected(false);
        } else {
          if (
            result.returnValue.faces[0].status === 0 ||
            result.returnValue.faces[0].status === 11 ||
            result.returnValue.faces[0].status === 10
          ) {
            setFaceDetected(true);
          }
          if (result.returnValue.faces[0].status === -1) {
            setFaceDetected(false);
          }
        }
        setHasFinished(true);
        break;
      default:
    }
  };

  return { faceDetected, isValidCall, hasFinished, setHasFinished };
};

export default useIsValid;
