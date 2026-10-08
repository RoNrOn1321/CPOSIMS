import { ImgHTMLAttributes } from 'react';
import logo from '../../images/logo.png';

export default function ApplicationLogo({
    className = '',
    alt = 'Saint Theresa College of Tandag, Inc.',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={logo}
            alt={alt}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}

