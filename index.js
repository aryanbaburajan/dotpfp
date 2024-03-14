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

function saveAsPNG() {
  convert(50, 4000);

  let render = document.getElementById("render");
  downloadSvg(render, "dotpfp.png");

  convert(50, 320);
}

function copyStylesInline(destinationNode, sourceNode) {
  let containerElements = ["svg", "g"];
  for (let cd = 0; cd < destinationNode.childNodes.length; cd++) {
    let child = destinationNode.childNodes[cd];
    if (containerElements.indexOf(child.tagName) != -1) {
      copyStylesInline(child, sourceNode.childNodes[cd]);
      continue;
    }
    let style =
      sourceNode.childNodes[cd].currentStyle ||
      window.getComputedStyle(sourceNode.childNodes[cd]);
    if (style == "undefined" || style == null) continue;
    for (let st = 0; st < style.length; st++) {
      child.style.setProperty(style[st], style.getPropertyValue(style[st]));
    }
  }
}

function triggerDownload(imgURI, fileName) {
  let evt = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true,
  });
  let a = document.createElement("a");
  a.setAttribute("download", fileName);
  a.setAttribute("href", imgURI);
  a.setAttribute("target", "_blank");
  a.dispatchEvent(evt);
}

function downloadSvg(svg, fileName) {
  let copy = svg.cloneNode(true);
  copyStylesInline(copy, svg);
  let canvas = document.createElement("canvas");
  let bbox = svg.getBBox();
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, bbox.width, bbox.height);
  let data = new XMLSerializer().serializeToString(copy);
  let DOMURL = window.URL || window.webkitURL || window;
  let img = new Image();
  let svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  let url = DOMURL.createObjectURL(svgBlob);
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    // DOMURL.revokeObjectURL(url);
    // if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
    //   let blob = canvas.msToBlob();
    //   navigator.msSaveOrOpenBlob(blob, fileName);
    // } else {
    //   let imgURI = canvas
    //     .toDataURL("image/png")
    //     .replace("image/png", "image/octet-stream");
    //   triggerDownload(imgURI, fileName);
    // }
  };
  img.src = url;
}
