export const WIDTH = 600;
export const HEIGHT = 300;
export const PADDING = 40;
export const OFFSET = 15;

export const COMMON_COLORS = [
  "#2563eb", // blue-600
  "#e11d48", // rose-600
  "#059669", // emerald-600
  "#f59e42", // amber-500
  "#a21caf", // purple-700
  "#0e7490", // cyan-700
  "#f43f5e", // pink-600
  "#b45309", // yellow-700
  "#52525b", // zinc-600
];

export async function downloadSvg (name: string, svg: string) {
  const a = document.createElement('a');
  a.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  a.download = `${name}.svg`;
  a.click();
};

export async function exportSvgToPng(svgString: string, width: number, height: number, fileName: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error("Failed to create PNG blob"));
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${fileName}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          resolve();
        }, 100);
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}
