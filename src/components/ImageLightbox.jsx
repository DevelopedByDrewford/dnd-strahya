import { useEffect } from 'react';
import './ImageLightbox.css';

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>
      <img
        className="lb-img"
        src={src}
        alt={alt || ''}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}
