"use client";
import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";

const PreviewLink = ({
  href,
  children,
  width = 1000,
  height = 500,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const [show, setShow] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const timer = useRef<NodeJS.Timeout | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  // 动态计算弹窗位置，避免超出窗口
  const handleShow = () => {
    if (!anchorRef.current) return setShow(true);
    const rect = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = rect.left;
    let top = rect.bottom + 8;
    // 右侧溢出
    if (left + width > vw - 8) left = Math.max(8, vw - width - 8);
    // 下方溢出
    if (top + height > vh - 8) top = rect.top - height - 8;
    // 上方还溢出则贴顶
    if (top < 8) top = 8;
    setPopupStyle({
      position: "fixed",
      left,
      top,
      zIndex: 1000,
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      borderRadius: 8,
      background: "#fff",
      border: "1px solid #eee",
      width,
      height,
      overflow: "hidden"
    });
    setShow(true);
  };

  // 弹窗内容，移出时延迟关闭，防止闪烁
  const closeTimer = useRef<NodeJS.Timeout | null>(null);
  const handlePopupMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShow(true);
  };
  const handlePopupMouseLeave = () => {
    closeTimer.current = setTimeout(() => setShow(false), 120);
  };
  // 生成带 preview 的 url
  let previewUrl = href;
  try {
    const urlObj = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (!urlObj.searchParams.has('preview')) {
      urlObj.searchParams.append('preview', '');
    }
    previewUrl = urlObj.toString();
  } catch {
    // href 可能是相对路径
    if (href.indexOf('?') >= 0) {
      previewUrl = href + '&preview=1';
    } else {
      previewUrl = href + '?preview=1';
    }
  }

  const [loading, setLoading] = useState(true);
  const popup = show ? (
    <div
      style={popupStyle}
      onMouseEnter={handlePopupMouseEnter}
      onMouseLeave={handlePopupMouseLeave}
    >
      <div style={{position:'relative',width:'100%',height:'100%'}}>
        {loading && (
          <div style={{
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)', zIndex: 2
          }}>
            <div className="animate-spin" style={{width:32,height:32,border:'4px solid #2563eb',borderTop:'4px solid transparent',borderRadius:'50%',margin:'auto'}} />
          </div>
        )}
        <iframe
          src={previewUrl}
          width={width}
          height={height}
          style={{ border: "none", width: "100%", height: "100%" }}
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
          title="Page Preview"
          onLoad={() => setLoading(false)}
          onLoadStart={() => setLoading(true)}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <a
        ref={anchorRef}
        href={href}
        onMouseEnter={() => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            setLoading(true);
            handleShow();
          }, 800);
        }}
        onMouseLeave={() => {
          if (timer.current) clearTimeout(timer.current);
          if (show) {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            closeTimer.current = setTimeout(() => setShow(false), 120);
          } else {
            setShow(false);
          }
        }}
        {...rest}
      >
        {children}
      </a>
      {typeof window !== "undefined" && show
        ? ReactDOM.createPortal(popup, document.body)
        : null}
    </>
  );
}

export default PreviewLink;
