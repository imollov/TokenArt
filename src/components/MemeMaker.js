import React, { useEffect, useRef, useState } from 'react';

export default function MemeMaker(props) {
  const canvasRef = useRef();
  const [file, setFile] = useState();
  const [text, setText] = useState({});
  const [price, setPrice] = useState('0');

  useEffect(() => {
    if (file && (text.topText || text.bottomText)) {
      renderImage(file).then(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (text.topText) {
          context.strokeText(text.topText, canvas.width / 2, 0.05 * canvas.height);
          context.fillText(text.topText, canvas.width / 2, 0.05 * canvas.height);
        }
        if (text.bottomText) {
          context.strokeText(text.bottomText, canvas.width / 2, 0.9 * canvas.height);
          context.fillText(text.bottomText, canvas.width / 2, 0.9 * canvas.height);
        }
      })
    }
  }, [file, text])

  const handleSubmit = (e) => {
    e.preventDefault();
    canvasRef.current.toBlob((blob) => {
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => {
        const buffer = Buffer(reader.result);
        props.upload(price, buffer);
      }
    })
  }

  const handleFileChange = (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    setFile(file);
    renderImage(file);
  }

  const handleTextChange = async (e) => {
    setText({ ...text, [e.target.name]: e.target.value });
  }

  const renderImage = (file) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      canvas.width = 500;
      canvas.height = 500;
      const reader = new window.FileReader();
      reader.onload = function (e) {
        if(e.target.readyState === FileReader.DONE) {
          const image = new Image();
          image.src = e.target.result;
          image.onload = function () {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            let a = (((canvas.width + canvas.height) / 2) * 4) / 100;
            context.font = a + 'pt sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'top';
            context.lineWidth = a / 5;
            context.strokeStyle = 'black';
            context.fillStyle = 'white';
            context.lineJoin = 'round';
            resolve();
          }
        }
      };
      reader.readAsDataURL(file);
    })
  }

  return (
    <div>
      <h2>Mint NFT</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='file' accept=".jpg, .jpeg, .png, .bmp, .gif"
          onChange={handleFileChange}
          className="my-2"
        />
        {file ? (
          <>
            <input
              name="topText"
              type="text"
              className="form-control my-3"
              placeholder="Top text..."
              onChange={handleTextChange}
              required
            />
            <input
              name="bottomText"
              type="text"
              className="form-control my-3"
              placeholder="Bottom text..."
              onChange={handleTextChange}
              required
            />
          </>
          ) : null
        }
        <canvas
          width="0"
          height="0"
          ref={canvasRef}
        />
        {file ? (
          <>
            <input
              name="price"
              type="text"
              className="form-control w-50 my-4"
              placeholder="Enter price in Eth ..."
              onChange={e => setPrice(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-block btn-lg">Upload</button>
          </>
          ) : null
        }
      </form>
    </div>
  );
}