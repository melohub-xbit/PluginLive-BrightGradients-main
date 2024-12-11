import React from "react";
import Webcam from "react-webcam";

const WebcamComponent = () => <Webcam />;

class WebcamCapture extends React.Component {
    render() {
      const videoConstraints = {
        facingMode: "user"
      };
  
      return <Webcam videoConstraints={videoConstraints} />;
    }
  }

  