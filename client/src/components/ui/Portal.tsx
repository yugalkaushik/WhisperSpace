import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

const Portal = ({ children, containerId = 'portal-root' }: PortalProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Create a container if it doesn't exist
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.setAttribute('id', containerId);
      portalContainer.style.position = 'fixed';
      portalContainer.style.zIndex = '9999';
      portalContainer.style.pointerEvents = 'none';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.width = '100%';
      portalContainer.style.height = '100%';
      document.body.appendChild(portalContainer);
    }
    
    return () => {
      setMounted(false);
      // Only remove the container if we created it and there are no children left
      const container = document.getElementById(containerId);
      if (container && container.childNodes.length === 0) {
        document.body.removeChild(container);
      }
    };
  }, [containerId]);

  if (!mounted) return null;
  
  const portalRoot = document.getElementById(containerId);
  if (!portalRoot) return null;
  
  return createPortal(children, portalRoot);
};

export default Portal;
