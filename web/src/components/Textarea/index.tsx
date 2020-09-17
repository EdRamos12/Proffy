import React, { TextareaHTMLAttributes } from 'react';
import './styles.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    desc?: string;
}

const Textarea: React.FC<TextareaProps> = ({name, label, desc, ...rest}) => {
    return (
        <div className="textarea-block">
            <label htmlFor={name}>{label}</label>
            <span>{desc}</span>
            <textarea id={name} {...rest} />
        </div>
    );
}

export default Textarea;