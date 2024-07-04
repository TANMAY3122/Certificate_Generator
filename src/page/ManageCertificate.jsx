import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
// import { getEventParticipants, giveEventCertificate } from "../../../../../../../../../../api";
import { useParams } from "react-router-dom";
// import { uploadMedia } from "../../../../../../../../reusable/uploadMedia";
// import apiService from "../../../../../../../../../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ImageEditor = () => {
  const [text, setText] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [logoURL, setLogoURL] = useState("");
  const [textArray, setTextArray] = useState([]);
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 });
  const [textFont, setTextFont] = useState("20px Arial");
  const [textColor, setTextColor] = useState("white");
  const [textSize, setTextSize] = useState("20px");
  const [inputBorderColor] = useState("blue");
  const canvasRef = useRef(null);
  const { id } = useParams();
  const [participantId, setParticipantId] = useState([]);
  const [placeholderText, setPlaceholderText] = useState("Participant Name");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loadImage = () => {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = imageURL;
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve();
        };
      });
    };

    const loadLogo = () => {
      return new Promise((resolve) => {
        if (logoURL) {
          const logo = new Image();
          logo.src = logoURL;
          logo.onload = () => {
            ctx.drawImage(logo, logoPosition.x, logoPosition.y, 50, 50);
            resolve();
          };
        } else {
          resolve();
        }
      });
    };

    const drawText = () => {
      textArray.forEach((textElement) => {
        ctx.font = textElement.font;
        ctx.fillStyle = textElement.color;
        ctx.fillText(
          textElement.text,
          textElement.position.x,
          textElement.position.y
        );
      });
    };

    Promise.all([loadImage(), loadLogo()]).then(() => {
      drawText();
    });
  }, [imageURL, logoURL, logoPosition, textArray]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImageURL(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setLogoURL(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const getParticipants = async () => {
    try {
      const res = await getEventParticipants(id);
      const userIds = res.data.data.map((item) => item._id);
      setParticipantId(userIds);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextDrag = (e, data, index) => {
    const newTextArray = [...textArray];
    newTextArray[index].position = { x: data.x, y: data.y };
    setTextArray(newTextArray);
  };

  const addText = () => {
    const newTextArray = [...textArray];
    newTextArray.push({
      text: text,
      position: { x: 10, y: 10 },
      font: `${textSize} ${textFont.split(" ")[1]}`, 
      color: textColor,
    });
    setTextArray(newTextArray);
    setText("");
  };

  const addPlaceholder = () => {
    const newTextArray = [...textArray];
    newTextArray.push({
      text: "{ParticipantName}",
      position: { x: 10, y: 10 },
      font: `${textSize} ${textFont.split(" ")[1]}`, 
      color: textColor, // Set the color dynamically
    });
    setTextArray(newTextArray);
  };

  const deleteText = (index) => {
    const newTextArray = [...textArray];
    newTextArray.splice(index, 1);
    setTextArray(newTextArray);
  };

  const deleteLogo = () => {
    setLogoURL("");
  };

  const saveCertificate = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const mediaLink = await uploadMedia(formData);
      return mediaLink; 
    } catch (error) {
      console.error("Error uploading certificate:", error);
      throw error; 
    }
  };

  const sendCertificate = async (participantId, mediaLink) => {
    try {
      const res = await apiService.post("organization/giveCertificate", {
        participantId,
        certificate: mediaLink,
        event: id,
      });
      // toast.success("Certificate Added to Participant");
    } catch (error) {
      console.error("Error sending certificate:", error);
    }
  };

  const handleSaveCertificate = async () => {
    try {
      const canvas = canvasRef.current;
      const canvasDataURL = canvas.toDataURL(); 
      const file = dataURLtoFile(canvasDataURL, 'certificate.png'); 
  
      const participants = await getEventParticipants(id);
      for (const participant of participants.data.data) {
        const customizedTextArray = textArray.map((textElement) => ({
          ...textElement,
          text: replacePlaceholder(textElement.text, participant.name),
        }));
        
        // Create a new canvas to draw the certificate with the participant's customized text
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const newCtx = newCanvas.getContext('2d');
        
        // Draw the image onto the new canvas
        const image = new Image();
        image.src = imageURL;
        await new Promise(resolve => {
          image.onload = () => {
            newCtx.drawImage(image, 0, 0, newCanvas.width, newCanvas.height);
            resolve();
          };
        });
  
        // Draw logo if available
        if (logoURL) {
          const logo = new Image();
          logo.src = logoURL;
          await new Promise(resolve => {
            logo.onload = () => {
              newCtx.drawImage(logo, logoPosition.x, logoPosition.y, 50, 50);
              resolve();
            };
          });
        }
        
        // Draw each text element onto the new canvas
        customizedTextArray.forEach((textElement) => {
          newCtx.font = textElement.font;
          newCtx.fillStyle = textElement.color;
          newCtx.fillText(
            textElement.text,
            textElement.position.x,
            textElement.position.y
          );
        });
  
        // Convert the new canvas to a data URL and then to a file
        const newCanvasDataURL = newCanvas.toDataURL();
        const newFile = dataURLtoFile(newCanvasDataURL, 'certificate.png');
  
        // Save the file
        const mediaLink = await saveCertificate(newFile);
  
        // Send the certificate to the participant
        await sendCertificate(participant._id, mediaLink);
        console.log(participant._id);
      }
  
      toast.success("Certificates Added to All Participants");
    } catch (error) {
      console.error("Error handling certificate:", error);
    }
  };

  const dataURLtoFile = (dataURL, filename) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const replacePlaceholder = (text, placeholder) => {
    return text.replace(/{ParticipantName}/g, placeholder);
  };

  useEffect(() => {
    getParticipants();
  }, []);

  return (
    <div className="mt-12 lg:ml-[300px]">
      <h1 className="title">Certificate Generator</h1>
      <br />
      
       {/* Existing JSX code */}
       <div className="grid grid-cols-2 gap-4 justify-between items-center">
        <div>
          <label
            className="block text-primary text-base font-medium"
            htmlFor="text-input"
          >
            Enter text:{" "}
          </label>
          <input
            className="w-full border border-primary rounded-lg p-1 mt-1"
            id="text-input"
            type="text"
            placeholder="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ border: `1px solid ${inputBorderColor}`, width: "200px" }}
          />
        </div>
        <div>
        <button className="bg-primary px-4 py-1 text-white rounded-md mb-2" onClick={addPlaceholder}>Add Placeholder: {"{ParticipantName}"}</button>
        </div>
        <div>
          <label
            className="block text-primary text-base font-medium"
            htmlFor="font-select"
          >
            Font:{" "}
          </label>
          <select
            id="font-select"
            onChange={(e) => setTextFont(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Lucida Calligraphy">Lucida Calligraphy</option>
            <option value="Ubuntu">Ubuntu</option>
            <option value="Raleway">Raleway</option>
          </select>
        </div>

        <div>
          <label
            className="block text-primary text-base font-medium"
            htmlFor="font-size-select"
          >
            Font Size:
          </label>
          <select
            id="font-size-select"
            onChange={(e) => setTextSize(e.target.value)}
          >
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
          </select>
        </div>

        <div>
          <label
            className="block text-primary text-base font-medium"
            htmlFor="color-input"
          >
            Font Color:{" "}
          </label>
          <input
            id="color-input"
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
      </div>

      <button
        className="bg-primary px-4 py-1 text-white rounded-md mt-4"
        onClick={addText}
      >
        Add Text
      </button>

      <div className="upload-container">
        <div className="upload-labels">
          <label
            className="block text-primary text-base font-medium"
            htmlFor="template-upload"
          >
            Upload your template:{" "}
          </label>
          <input
            className="w-full border border-primary rounded-lg p-1 mt-1"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ border: `1px solid ${inputBorderColor}` }}
          />
        </div>

        <div className="upload-inputs">
          <label
            className="block text-primary text-base font-medium"
            htmlFor="sign-upload"
          >
            Upload your signature:{" "}
          </label>
          <input
            className="w-full border border-primary rounded-lg p-1 mt-1"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ border: `1px solid ${inputBorderColor}` }}
          />
        </div>
        <div className="upload-inputs">
          <label
            className="block text-primary text-base font-medium"
            htmlFor="sign-upload"
          >
            Upload your signature:{" "}
          </label>
          <input
            className="w-full border border-primary rounded-lg p-1 mt-1"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ border: `1px solid ${inputBorderColor}` }}
          />
        </div>
      </div>

      <br />
      {textArray.map((textElement, index) => (
        <Draggable
          key={index}
          position={textElement.position}
          onDrag={(e, data) => handleTextDrag(e, data, index)}
        >
          <div>
            <p>{ }</p>
            {/* you can switch between single and double click whatever works best */}
            <button
              onDoubleClick={() => deleteText(index)}
              style={{
                position: "absolute",
                zIndex: 2,
                marginLeft: "5px",
                userSelect: "none",
              }}
            >
              X
            </button>
          </div>
        </Draggable>
      ))}
      <br />
      <Draggable
        position={logoPosition}
        onDrag={(e, data) => setLogoPosition({ x: data.x, y: data.y })}
      >
        <div>
          {logoURL && (
            <div>
              <img />
              <button
                onDoubleClick={deleteLogo}
                style={{ position: "absolute", zIndex: 2, marginLeft: "5px" }}
              >
                X
              </button>
            </div>
          )}
        </div>
      </Draggable>
      <br />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
      />
      <br />

      <button className="bg-primary px-4 py-1 text-white rounded-md mb-5" onClick={handleSaveCertificate}>Send Certificates to Participants</button>
      
    </div>
  );
};

export default ImageEditor;
