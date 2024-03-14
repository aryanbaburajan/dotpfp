handleFileInputChange();

function handleFileInputChange() {
  let fileInput = document.getElementById("image-input");
  fileInput.onchange = () => {
    if (fileInput.files.length !== 0) {
      convert(50, 320);
    }
  };
}

function drawResizedImageIntoCanvas(width, height, image) {
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

  return { canvas, ctx };
}

function scrollOnTo(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth",
  });
}

function convert(inputScale, outputScale) {
  const imageInput = document.getElementById("image-input");
  const file = imageInput.files[0];

  const reader = new FileReader();

  reader.onload = function (e) {
    const image = new Image();

    image.onload = function () {
      const render = document.getElementById("render");
      const renderCtx = render.getContext("2d");

      const ratio = Number(outputScale / inputScale);
      const radius = ratio / 2;

      const width = inputScale * (image.width / image.height);
      const height = inputScale;

      let { canvas, ctx } = drawResizedImageIntoCanvas(width, height, image);

      render.width = width * ratio;
      render.height = height * ratio;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let grayscale = [];
      for (let i = 0; i < pixels.length; i += 4) {
        grayscale.push(
          0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2]
        );
      }

      renderCtx.fillStyle = "black";
      renderCtx.fillRect(0, 0, render.width, render.height);

      grayscale.forEach((value, i) => {
        const x = i % canvas.width;
        const y = Math.floor(i / canvas.width);
        const lightness = radius * (value / 255);

        renderCtx.beginPath();
        renderCtx.arc(
          x * ratio + radius,
          y * ratio + radius,
          lightness,
          0,
          2 * Math.PI,
          false
        );
        renderCtx.fillStyle = "white";
        renderCtx.fill();
      });
    };

    image.src = e.target.result;
  };

  reader.readAsDataURL(file);
  scrollOnTo("result");
}

function saveAsPNG() {
  convert(50, 4000);

  let render = document.getElementById("render");
  let url = render
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");

  var a = document.createElement("a");
  a.href = url;
  a.download = "dotpfp.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  convert(50, 320);
}
