import React from 'react';

/**
 * Logo MedEqui — GMAO biomédicale
 * Combine : bouclier (protection) + pulsation cardiaque (médical) + clé (maintenance)
 */
export function MedEquiLogo({ size = 46, variant = 'dark' }) {
    const colors = variant === 'dark'
        ? { bg: '#163a34', accent: '#c8f0d8', line: '#ffffff' }
        : { bg: '#ffffff', accent: '#247451', line: '#163a34' };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="MedEqui"
            role="img"
        >
            {/* Fond arrondi */}
            <rect
                x="2" y="2" width="60" height="60" rx="14"
                fill={colors.bg}
            />

            {/* Bouclier stylisé (protection) */}
            <path
                d="M32 10 L50 16 V34 C50 44 42 51 32 54 C22 51 14 44 14 34 V16 Z"
                fill="none"
                stroke={colors.accent}
                strokeWidth="2.5"
                strokeLinejoin="round"
            />

            {/* Pulsation cardiaque */}
            <path
                d="M19 33 H26 L29 27 L33 39 L36 33 H45"
                fill="none"
                stroke={colors.line}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Petit point lumineux (activité) */}
            <circle cx="33" cy="18" r="2" fill={colors.accent} />
        </svg>
    );
}

export default MedEquiLogo;