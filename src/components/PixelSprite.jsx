import React from 'react';
import { MATRICES, getColorMap } from '../lib/matrices';

export default function PixelSprite({
    templateName,
    baseColor,
    scale = 1,
    style = {},
    className = ''
}) {
    const matrix = MATRICES[templateName];
    if (!matrix) return null;

    const colorMap = getColorMap(baseColor);

    // We treat each character in the string as a pixel.
    const width = matrix[0].length;
    const height = matrix.length;

    // Base size per pixel is 4px. Scale multiplies this.
    const renderWidth = width * 4 * scale;
    const renderHeight = height * 4 * scale;

    return (
        <svg
            className={`pixel-art-sprite ${className}`}
            width={renderWidth}
            height={renderHeight}
            viewBox={`0 0 ${width} ${height}`}
            style={{ ...style, display: 'inline-block' }}
        >
            {matrix.map((row, y) =>
                row.split('').map((char, x) => {
                    const color = colorMap[char];
                    if (!color || color === 'transparent' || char === ' ') return null;
                    return (
                        <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width="1"
                            height="1"
                            fill={color}
                        />
                    );
                })
            )}
        </svg>
    );
}
