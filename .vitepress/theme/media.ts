// ============================================================
// 图片与大文件地址（与 Cloudflare R2 对象存储对接的唯一入口）
// ------------------------------------------------------------
// 本地开发：VITE_MEDIA_BASE 为空 → 读取 public/media/ 下的文件
// 正式上线：VITE_MEDIA_BASE=https://media.你的域名 → 读取 R2
//
// R2 中每幅图片一个文件夹，结构固定（由图片处理脚本自动生成）：
//   thangka/0001/thumb.webp     缩略图，长边约 480px，用于目录网格
//   thangka/0001/display.webp   浏览图，长边约 2000px，点开即看
//   thangka/0001/original.jpg   原图，仅供下载
//   thangka/0001/tiles/…        细节放大用的瓦片（以后接入放大查看器）
// 页面里只写图片编号，例如 <MediaImage id="thangka/0001" />
// ============================================================

declare const __MEDIA_BASE__: string

export const MEDIA_BASE: string = __MEDIA_BASE__ || '/media'

export function mediaUrl(path: string): string {
  return `${MEDIA_BASE}/${path.replace(/^\/+/, '')}`
}

export function imageSet(id: string) {
  const base = id.replace(/^\/+|\/+$/g, '')
  return {
    thumb: mediaUrl(`${base}/thumb.webp`),
    display: mediaUrl(`${base}/display.webp`),
    original: mediaUrl(`${base}/original.jpg`),
    tiles: mediaUrl(`${base}/tiles/`)
  }
}
