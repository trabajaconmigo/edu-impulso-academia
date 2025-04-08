// VideoViewPopup.tsx

import React from 'react';

interface VideoViewPopupProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoViewPopup: React.FC<VideoViewPopupProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="video-popup">
      <div className="video-popup-content">
        <iframe src={videoUrl} title="Preview Video" allowFullScreen />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default VideoViewPopup;
