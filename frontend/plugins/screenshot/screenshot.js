// screenshot.js

const { ipcRenderer, clipboard, nativeImage } = require('electron');

const canvas = document.getElementById('canvas');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

let dragging = false;
let startPos = { x: 0, y: 0 };
let currentPos = { x: 0, y: 0 };
let imgSrc = null;

function init() {
  resizeCanvas();
  // 接收主进程发来的截图数据
  ipcRenderer.once('load-image', (_, base64) => {
    imgSrc = base64;
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  });

  // 鼠标事件
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // 按钮事件
  document.getElementById('confirm').addEventListener('click', onConfirm);
  document.getElementById('close').addEventListener('click', onClose);
  document.getElementById('snipaste').addEventListener('click', onSnipaste);

  // 窗口大小改变时重置 canvas
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (imgSrc) {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}

function onMouseDown(e) {
  dragging = true;
  startPos = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
  if (!dragging) return;
  currentPos = { x: e.clientX, y: e.clientY };
  redraw();
}

function onMouseUp() {
  dragging = false;
  // 将工具栏定位到选区右下方
  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.max(startPos.y, currentPos.y) + 8;
  toolbar.style.left = `${left}px`;
  toolbar.style.top = `${top}px`;
  toolbar.style.display = 'flex';
}

function redraw() {
  if (!imgSrc) return;
  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 蒙层
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 清除选区并画红框
    const { x, y, w, h } = getSelectionBounds();
    ctx.clearRect(x, y, w, h);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  };
}

function getSelectionBounds() {
  const x = Math.min(startPos.x, currentPos.x);
  const y = Math.min(startPos.y, currentPos.y);
  const w = Math.abs(startPos.x - currentPos.x);
  const h = Math.abs(startPos.y - currentPos.y);
  return { x, y, w, h };
}

// “确认”——复制选区到系统剪贴板并关闭窗口
function onConfirm() {
  const { x, y, w, h } = getSelectionBounds();

  // 用原始截图数据创建 Image 对象
  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    // 临时 canvas，用于真正裁剪
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');

    // 从原始图像中裁剪
    tempCtx.drawImage(img, x, y, w, h, 0, 0, w, h);

    // 写入剪贴板
    const dataURL = tempCanvas.toDataURL('image/png');
    const image = nativeImage.createFromDataURL(dataURL);
    clipboard.writeImage(image);

    // 关闭编辑器
    ipcRenderer.send('screenshot-cancel');
  };
}

// “关闭”——直接关闭窗口
function onClose() {
  ipcRenderer.send('screenshot-cancel');
}

// “贴图”——发送选区图像数据给主进程（保留旧逻辑）
function onSnipaste() {
  const { x, y, w, h } = getSelectionBounds();
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  ipcRenderer.send('screenshot-confirm', tempCanvas.toDataURL());
}

init();
