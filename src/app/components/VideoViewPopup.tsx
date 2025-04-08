// src/components/VideoViewPopup.tsx

"use client";

import React from "react";
import styles from "./VideoViewPopup.module.css";

interface VideoViewPopupProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoViewPopup: React.FC<VideoViewPopupProps> = ({ videoUrl, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <div className={styles.videoWrapper}>
          <iframe
            src={videoUrl}
            title="Vista previa del curso"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default VideoViewPopup;
