import PixelSprite from './PixelSprite';

export default function GameIcon({ type, scale = 0.4 }) {
    switch (type) {
        case 'coin':
            return <PixelSprite templateName="coin" baseColor="#fbbf24" scale={scale} />;
        case 'water':
            return <PixelSprite templateName="waterDrop" baseColor="#3b82f6" scale={scale} />;
        case 'fertilizer':
            return <PixelSprite templateName="fertilizerBag" baseColor="#10b981" scale={scale} />;
        case 'seed':
            return <PixelSprite templateName="seed" baseColor="#a78bfa" scale={scale} />;
        default:
            return null;
    }
}
