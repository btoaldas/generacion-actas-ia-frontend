
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-12 w-12 border-4',
        lg: 'h-24 w-24 border-8',
    };

    return (
        <div
            className={`animate-spin rounded-full border-solid border-purple-500 border-t-transparent ${sizeClasses[size]}`}
            role="status"
            aria-live="polite"
        >
             <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
