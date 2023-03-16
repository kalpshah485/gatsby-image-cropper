import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";

type RectPosition = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const IndexPage: React.FC<PageProps> = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const newImageRef = React.useRef<HTMLImageElement>(null);
  const anchorRef = React.useRef<HTMLAnchorElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);

  let mouseDown: boolean,
    resizeML: boolean,
    resizeMT: boolean,
    resizeMR: boolean,
    resizeMB: boolean,
    resizeTL: boolean,
    resizeBL: boolean,
    resizeTR: boolean,
    resizeBR: boolean,
    dragRect: boolean = false;
  let rectPosition: RectPosition;
  const minHeight: number = 50;
  const minWidth: number = 50;
  let startX: number, startY: number;
  let ctx: CanvasRenderingContext2D | null;

  function drawImageAndRect(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    rectPosition: RectPosition
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      5,
      5,
      canvas.width - 10,
      canvas.height - 10
    );
    ctx.beginPath();
    ctx.rect(
      rectPosition.left,
      rectPosition.top,
      rectPosition.width,
      rectPosition.height
    );
    ctx.stroke();
  }

  function drawCirle(
    ctx: CanvasRenderingContext2D,
    startPosition: number,
    endPosition: number
  ) {
    ctx.beginPath();
    ctx.arc(startPosition, endPosition, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }

  function drawCirles(
    ctx: CanvasRenderingContext2D,
    rectPosition: RectPosition
  ) {
    // drawing cirles on corners
    drawCirle(ctx, rectPosition.left, rectPosition.top);
    drawCirle(ctx, rectPosition.left, rectPosition.top + rectPosition.height);
    drawCirle(ctx, rectPosition.left + rectPosition.width, rectPosition.top);
    drawCirle(
      ctx,
      rectPosition.left + rectPosition.width,
      rectPosition.top + rectPosition.height
    );

    // drawing middle circles
    drawCirle(
      ctx,
      rectPosition.left,
      rectPosition.top + Math.round(rectPosition.height / 2)
    );
    drawCirle(
      ctx,
      rectPosition.left + Math.round(rectPosition.width / 2),
      rectPosition.top
    );
    drawCirle(
      ctx,
      rectPosition.left + Math.round(rectPosition.width / 2),
      rectPosition.top + rectPosition.height
    );
    drawCirle(
      ctx,
      rectPosition.left + rectPosition.width,
      rectPosition.top + Math.round(rectPosition.height / 2)
    );
  }

  function resetDragVars() {
    resizeML = false;
    resizeMR = false;
    resizeMB = false;
    resizeMT = false;
    resizeTL = false;
    resizeBL = false;
    resizeTR = false;
    resizeBR = false;
    dragRect = false;
  }

  function checkBoundary(
    offsetX: number,
    offsetY: number,
    left: number,
    top: number
  ) {
    return (
      offsetX > left - 5 &&
      offsetX <= left + 5 &&
      offsetY > top - 5 &&
      offsetY <= top + 5
    );
  }

  function handleMouseMove(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      if (!mouseDown) {
        if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left,
            rectPosition.top
          )
        ) {
          canvas.style.cursor = "nw-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left,
            rectPosition.top + rectPosition.height
          )
        ) {
          canvas.style.cursor = "sw-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left + rectPosition.width,
            rectPosition.top
          )
        ) {
          canvas.style.cursor = "ne-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left + rectPosition.width,
            rectPosition.top + rectPosition.height
          )
        ) {
          canvas.style.cursor = "se-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left,
            rectPosition.top + Math.round(rectPosition.height / 2)
          )
        ) {
          canvas.style.cursor = "w-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left + rectPosition.width,
            rectPosition.top + Math.round(rectPosition.height / 2)
          )
        ) {
          canvas.style.cursor = "e-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left + Math.round(rectPosition.width / 2),
            rectPosition.top
          )
        ) {
          canvas.style.cursor = "n-resize";
        } else if (
          checkBoundary(
            e.offsetX,
            e.offsetY,
            rectPosition.left + Math.round(rectPosition.width / 2),
            rectPosition.top + rectPosition.height
          )
        ) {
          canvas.style.cursor = "s-resize";
        } else if (
          rectPosition.left < e.offsetX - 5 &&
          rectPosition.top < e.offsetY - 2 &&
          e.offsetX + 2 < rectPosition.left + rectPosition.width &&
          e.offsetY + 5 < rectPosition.top + rectPosition.height
        ) {
          canvas.style.cursor = "move";
        } else {
          canvas.style.cursor = "default";
        }
      }
      if (!mouseDown) return;
      const dx = e.offsetX - startX;
      const dy = e.offsetY - startY;
      if (resizeML) {
        if (rectPosition.width < minWidth && dx > 0) return;
        rectPosition.left += dx;
        if (rectPosition.left < 5) {
          rectPosition.left -= dx;
          rectPosition.width += rectPosition.left - 5;
          rectPosition.left = 5;
        } else {
          rectPosition.width -= dx;
        }
        startX = e.offsetX;
      } else if (resizeMT) {
        if (rectPosition.height < minHeight && dy > 0) return;
        rectPosition.top += dy;
        if (rectPosition.top < 5) {
          rectPosition.top -= dy;
          rectPosition.height += rectPosition.top - 5;
          rectPosition.top = 5;
        } else {
          rectPosition.height -= dy;
        }
        startY = e.offsetY;
      } else if (resizeMB) {
        if (rectPosition.height < minHeight && dy < 0) return;
        if (rectPosition.top + dy + 4 + rectPosition.height < canvas.height) {
          rectPosition.height += dy;
        }
        startY = e.offsetY;
      } else if (resizeMR) {
        if (rectPosition.width < minWidth && dx < 0) return;
        if (rectPosition.left + dx + 4 + rectPosition.width < canvas.width) {
          rectPosition.width += dx;
        }
        startX = e.offsetX;
      } else if (resizeTL) {
        if (!(rectPosition.width < minWidth && dx > 0)) {
          rectPosition.left += dx;
          if (rectPosition.left < 5) {
            rectPosition.left -= dx;
            rectPosition.width += rectPosition.left - 5;
            rectPosition.left = 5;
          } else {
            rectPosition.width -= dx;
          }
          startX = e.offsetX;
        }
        if (!(rectPosition.height < minHeight && dy > 0)) {
          rectPosition.top += dy;
          if (rectPosition.top < 5) {
            rectPosition.top -= dy;
            rectPosition.height += rectPosition.top - 5;
            rectPosition.top = 5;
          } else {
            rectPosition.height -= dy;
          }
          startY = e.offsetY;
        }
      } else if (resizeBL) {
        if (!(rectPosition.width < minWidth && dx > 0)) {
          rectPosition.left += dx;
          if (rectPosition.left < 5) {
            rectPosition.left -= dx;
            rectPosition.width += rectPosition.left - 5;
            rectPosition.left = 5;
          } else {
            rectPosition.width -= dx;
          }
          startX = e.offsetX;
        }
        if (!(rectPosition.height < minHeight && dy < 0)) {
          if (rectPosition.top + dy + 4 + rectPosition.height < canvas.height) {
            rectPosition.height += dy;
          }
          startY = e.offsetY;
        }
      } else if (resizeTR) {
        if (!(rectPosition.width < minWidth && dx < 0)) {
          if (rectPosition.left + dx + 4 + rectPosition.width < canvas.width) {
            rectPosition.width += dx;
          }
          startX = e.offsetX;
        }
        if (!(rectPosition.height < minHeight && dy > 0)) {
          rectPosition.top += dy;
          if (rectPosition.top < 5) {
            rectPosition.top -= dy;
            rectPosition.height += rectPosition.top - 5;
            rectPosition.top = 5;
          } else {
            rectPosition.height -= dy;
          }
          startY = e.offsetY;
        }
      } else if (resizeBR) {
        if (!(rectPosition.width < minWidth && dx < 0)) {
          if (rectPosition.left + dx + 4 + rectPosition.width < canvas.width) {
            rectPosition.width += dx;
          }
          startX = e.offsetX;
        }
        if (!(rectPosition.height < minHeight && dy < 0)) {
          if (rectPosition.top + dy + 4 + rectPosition.height < canvas.height) {
            rectPosition.height += dy;
          }
          startY = e.offsetY;
        }
      } else if (dragRect) {
        if (
          rectPosition.left + dx - 4 > 0 &&
          rectPosition.left + dx + 4 + rectPosition.width < canvas.width
        ) {
          rectPosition.left += dx;
        }
        if (
          rectPosition.top + dy - 4 > 0 &&
          rectPosition.top + dy + 4 + rectPosition.height < canvas.height
        ) {
          rectPosition.top += dy;
        }
        startX = e.offsetX;
        startY = e.offsetY;
      }
      drawImageAndRect(ctx, canvas, imageRef.current, rectPosition);
      drawCirles(ctx, rectPosition);
    } else {
      console.log("canvas and image is not loaded in handleMouseMove");
    }
  }

  function handleMouseDown(e: MouseEvent) {
    mouseDown = true;
    startX = e.offsetX;
    startY = e.offsetY;
    if (
      checkBoundary(e.offsetX, e.offsetY, rectPosition.left, rectPosition.top)
    ) {
      resizeTL = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left,
        rectPosition.top + rectPosition.height
      )
    ) {
      resizeBL = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left + rectPosition.width,
        rectPosition.top
      )
    ) {
      resizeTR = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left + rectPosition.width,
        rectPosition.top + rectPosition.height
      )
    ) {
      resizeBR = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left,
        rectPosition.top + Math.round(rectPosition.height / 2)
      )
    ) {
      resizeML = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left + rectPosition.width,
        rectPosition.top + Math.round(rectPosition.height / 2)
      )
    ) {
      resizeMR = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left + Math.round(rectPosition.width / 2),
        rectPosition.top
      )
    ) {
      resizeMT = true;
    } else if (
      checkBoundary(
        e.offsetX,
        e.offsetY,
        rectPosition.left + Math.round(rectPosition.width / 2),
        rectPosition.top + rectPosition.height
      )
    ) {
      resizeMB = true;
    } else if (
      rectPosition.left < e.offsetX - 5 &&
      rectPosition.top < e.offsetY - 5 &&
      e.offsetX + 5 < rectPosition.left + rectPosition.width &&
      e.offsetY + 5 < rectPosition.top + rectPosition.height
    ) {
      dragRect = true;
    }
  }

  function handleMouseUp() {
    mouseDown = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
    resetDragVars();
  }

  function calculateRectPosition(position: number, param: "width" | "height") {
    if (imageRef.current && canvasRef.current) {
      if (param == "width")
        return (
          (imageRef.current.naturalWidth * position) / canvasRef.current.width
        );
      else
        return (
          (imageRef.current.naturalHeight * position) / canvasRef.current.height
        );
    } else {
      throw new Error("image ref not defined");
    }
  }

  function cropImage() {
    const newCanvas = document.createElement("canvas");
    if (rectPosition) {
      newCanvas.width = rectPosition.width;
      newCanvas.height = rectPosition.height;
      const newCtx = newCanvas.getContext("2d");
      if (newCtx && imageRef.current) {
        newCtx.drawImage(
          imageRef.current,
          imageRef.current.naturalWidth < window.innerWidth
            ? rectPosition.left - 5
            : calculateRectPosition(rectPosition.left - 5, "width"),
          imageRef.current.naturalHeight < window.innerHeight
            ? rectPosition.top - 5
            : calculateRectPosition(rectPosition.top - 5, "height"),
          imageRef.current.naturalWidth < window.innerWidth
            ? newCanvas.width
            : calculateRectPosition(newCanvas.width + 5, "width"),
          imageRef.current.naturalHeight < window.innerHeight
            ? newCanvas.height
            : calculateRectPosition(newCanvas.height + 5, "height"),
          0,
          0,
          newCanvas.width,
          newCanvas.height
        );
        const dataURL = newCanvas.toDataURL("image/png");
        if (newImageRef.current && anchorRef.current) {
          newImageRef.current.src = dataURL;
          newImageRef.current.style.display = "block";
          anchorRef.current.href = dataURL;
          anchorRef.current.download = newImageRef.current.alt;
          anchorRef.current.style.display = "block";
        }
      }
    } else {
      console.log("rectPosition not defined");
    }
  }

  function handleImageChange(e: React.BaseSyntheticEvent) {
    const file = e.target.files[0];
    if (file && imageRef.current) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === "string" && imageRef.current) {
          imageRef.current.src = fileReader.result;
        }
      };
      fileReader.readAsDataURL(file);
    }
  }

  React.useEffect(() => {
    if (imageRef.current) {
      if (!ctx && canvasRef.current) {
        ctx = canvasRef.current.getContext("2d");
      }
      imageRef.current.onload = () => {
        if (canvasRef.current && imageRef.current) {
          let scale_factor = Math.min(
            window.innerWidth / imageRef.current.naturalWidth,
            window.innerHeight / imageRef.current.naturalHeight
          );
          console.log(scale_factor);
          canvasRef.current.width =
            imageRef.current.naturalWidth > window.innerWidth
              ? imageRef.current.naturalWidth * scale_factor + 10
              : imageRef.current.naturalWidth + 10;
          canvasRef.current.height =
            imageRef.current.naturalHeight > window.innerHeight
              ? imageRef.current.naturalHeight * scale_factor + 10
              : imageRef.current.naturalHeight + 10;
          rectPosition = {
            left: Math.round(canvasRef.current.width / 10),
            top: Math.round(canvasRef.current.height / 10),
            width:
              canvasRef.current.width - Math.round(canvasRef.current.width / 5),
            height:
              canvasRef.current.height -
              Math.round(canvasRef.current.height / 5),
          };
          if (ctx) {
            canvasRef.current.addEventListener("mousemove", (e: MouseEvent) => {
              if (ctx) {
                handleMouseMove(e, ctx);
              }
            });
            canvasRef.current.addEventListener("mousedown", handleMouseDown);
            canvasRef.current.addEventListener("mouseup", handleMouseUp);
            canvasRef.current.addEventListener("mouseout", handleMouseUp);
            ctx.strokeStyle = "#4d90fe";
            ctx.fillStyle = "#4d90fe";
            console.log(ctx, canvasRef.current, imageRef.current, rectPosition);
            drawImageAndRect(
              ctx,
              canvasRef.current,
              imageRef.current,
              rectPosition
            );
            drawCirles(ctx, rectPosition);
            setImageLoaded(true);
          } else {
            console.log("ctx is null");
          }
        } else {
          console.log("canvas and image is not loaded");
        }
      };
    }
  });

  return (
    <main>
      <h1>Image Cropping Page</h1>
      <h2>Please select image from your file system</h2>
      <input onChange={handleImageChange} type="file" />
      <br />
      <img ref={imageRef} style={{ display: "none" }} alt="canvasImage" />
      <div style={{ display: imageLoaded ? "block" : "none" }}>
        <canvas ref={canvasRef}></canvas>
        <br />
        <button ref={btnRef}>Crop Image</button>
        <br />
        <img
          ref={newImageRef}
          style={{ display: "none" }}
          alt="cropped-image"
        />
        <a ref={anchorRef} style={{ display: "none" }}>
          Download
        </a>
      </div>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
