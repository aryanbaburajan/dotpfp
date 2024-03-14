handleFileInputChange();

function handleFileInputChange() {
  let fileInput = document.getElementById("image-input");
  fileInput.onchange = () => {
    if (fileInput.files.length !== 0) {
      document.getElementById("convert-btn").disabled = false;
    }
  };
}

function drawResizedImageIntoCanvas(width, height, image) {
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    offCanvas = document.createElement("canvas"),
    offCanvasCtx = offCanvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  let cur = {
    width: Math.floor(image.width * 0.5),
    height: Math.floor(image.height * 0.5),
  };

  offCanvas.width = cur.width;
  offCanvas.height = cur.height;

  offCanvasCtx.drawImage(image, 0, 0, cur.width, cur.height);

  while (cur.width * 0.5 > width) {
    cur = {
      width: Math.floor(cur.width * 0.5),
      height: Math.floor(cur.height * 0.5),
    };
    offCanvasCtx.drawImage(
      offCanvas,
      0,
      0,
      cur.width * 2,
      cur.height * 2,
      0,
      0,
      cur.width,
      cur.height
    );
  }

  ctx.drawImage(
    offCanvas,
    0,
    0,
    cur.width,
    cur.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return { canvas, ctx };
}

function scrollOnTo(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth",
  });
}

function convert() {
  const imageInput = document.getElementById("image-input");
  const file = imageInput.files[0];

  const inputScale = 50;
  const outputScale = 320;
  // const outputScale = 4000;

  const reader = new FileReader();

  reader.onload = function (e) {
    const image = new Image();

    image.onload = function () {
      const render = document.getElementById("render");

      const ratio = Number(outputScale / inputScale);
      const radius = ratio / 2;

      const width = inputScale * (image.width / image.height);
      const height = inputScale;

      let { canvas, ctx } = drawResizedImageIntoCanvas(width, height, image);

      render.style.width = width * ratio;
      render.style.height = height * ratio;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let grayscale = [];
      for (let i = 0; i < pixels.length; i += 4) {
        grayscale.push(
          0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2]
        );
      }

      const circles = grayscale.map((value, i) => {
        const x = i % canvas.width;
        const y = Math.floor(i / canvas.width);
        const lightness = radius * (value / 255);
        return `<circle r="${lightness}" cx="${x * ratio + radius}" cy="${
          y * ratio + radius
        }" fill="#ffffff"></circle>`;
      });

      render.innerHTML = circles.join("");
    };

    image.src = e.target.result;
  };

  reader.readAsDataURL(file);
  scrollOnTo("result");
}

function saveAsSVG() {
  let render = document.getElementById("render");

  const base64doc = btoa(decodeURIComponent(render.outerHTML));

  const a = document.createElement("a");
  a.download = "dotpfp.svg";
  a.href = "data:text/html;base64," + base64doc;
  a.click();
}

// refactor
// function saveAsPNG() {
//   let render = document.getElementById("render");

//   (img = new Image()),
//     (serializer = new XMLSerializer()),
//     (svgStr = serializer.serializeToString(render));

//   img.src = "data:image/svg+xml;base64," + window.btoa(svgStr);

//   var canvas = document.createElement("canvas");

//   var w = render.style.width.slice(0, -2);
//   var h = render.style.height.slice(0, -2);

//   canvas.width = w;
//   canvas.height = h;
//   canvas.getContext("2d").drawImage(img, 0, 0, w, h);

//   var imgURL = canvas.toDataURL("image/png");

//   var dlLink = document.createElement("a");
//   dlLink.download = "image";
//   dlLink.href = imgURL;
//   dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(
//     ":"
//   );

//   console.log(imgURL);

//   document.body.appendChild(dlLink);
//   dlLink.click();
//   document.body.removeChild(dlLink);
// }
