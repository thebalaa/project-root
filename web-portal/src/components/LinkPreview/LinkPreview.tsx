import React, { useState, useEffect } from 'react';
import './LinkPreview.css';

interface LinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Failed to fetch preview');
        
        const data = await response.json();
        if (!data.title && !data.description && !data.image) {
          throw new Error('No preview data available');
        }
        
        setMetadata(data);
        setError(false);
      } catch (err) {
        console.error('Error fetching link preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchMetadata();
    }
  }, [url]);

  if (loading) return <div className="link-preview-loading">Loading preview...</div>;
  if (error || !metadata) return null;

  return (
    <div className="link-preview">
      <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-container">
        {metadata.image && (
          <div className="link-preview-image">
            <img 
              src={metadata.image} 
              alt={metadata.title || 'Link preview'} 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="link-preview-content">
          {metadata.title && <h4>{metadata.title}</h4>}
          {metadata.description && <p>{metadata.description}</p>}
          <span className="link-preview-url">{new URL(url).hostname}</span>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview; 