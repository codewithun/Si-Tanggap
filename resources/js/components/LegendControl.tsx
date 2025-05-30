import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

interface LegendProps {
    position?: 'bottomleft' | 'bottomright' | 'topleft' | 'topright';
    icons: Array<{
        icon: string;
        label: string;
    }>;
}

const LegendControl = ({ position = 'topleft', icons }: LegendProps) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const legend = new L.Control({ position });

        legend.onAdd = () => {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar legend-container');
            container.style.cssText = `
        background: none;
        border: none;
        box-shadow: none;
        margin: 10px;
        pointer-events: auto;
      `; // Create toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18M3 9h18"/>
          </svg>
          Legenda
        </div>
      `;
            toggleBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        backdrop-filter: blur(8px);
        &:hover {
          background-color: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `;
            // Create legend content
            const legendContent = document.createElement('div');
            legendContent.style.cssText = `
        background-color: rgba(255, 255, 255, 0.6);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-top: 8px;
        max-width: 220px;
        backdrop-filter: blur(8px);
        display: ${isVisible ? 'block' : 'none'};
      `;

            const title = document.createElement('div');
            title.innerHTML = 'Icon Bencana';
            title.style.cssText = `
        font-weight: 600;
        margin-bottom: 8px;
        color: #1f2937;
        font-size: 13px;
      `;
            legendContent.appendChild(title);
            const iconsContainer = document.createElement('div');
            iconsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px;
        margin-top: 4px;
      `;

            icons.forEach(({ icon, label }) => {
                const item = document.createElement('div');
                item.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          &:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: translateY(-1px);
          }
        `;
                const img = document.createElement('img');

                // If icon already starts with 'icon-', don't add the prefix again
                const iconName = icon.startsWith('icon-') ? icon : `icon-${icon}`;

                // Set a one-time error handler (prevents infinite loop)
                let hasTriedPNG = false;
                img.onerror = () => {
                    if (!hasTriedPNG) {
                        hasTriedPNG = true;
                        img.src = `/icons/${iconName}.png`;
                    }
                    // No further fallback after PNG to prevent loops
                };

                // Try SVG first
                img.src = `/icons/${iconName}.svg`;
                img.alt = label;
                img.style.cssText = `
          width: 20px;
          height: 20px;
          object-fit: contain;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));
        `;
                const text = document.createElement('span');
                text.textContent = label;
                text.style.cssText = `
          font-size: 12px;
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        `;

                item.appendChild(img);
                item.appendChild(text);
                iconsContainer.appendChild(item);
            });

            legendContent.appendChild(iconsContainer);

            // Add click handler for toggle button
            toggleBtn.addEventListener('click', () => {
                setIsVisible(!isVisible);
                legendContent.style.display = isVisible ? 'none' : 'block';
            });

            // Prevent map click events from triggering on the control
            L.DomEvent.disableClickPropagation(container);

            container.appendChild(toggleBtn);
            container.appendChild(legendContent);
            return container;
        };

        legend.addTo(map);

        return () => {
            legend.remove();
        };
    }, [map, position, icons, isVisible]);

    return null;
};

export default LegendControl;
