import React, { SelectHTMLAttributes } from 'react';
import './styles.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    name: string;
    custom_id?: string;
    options: Array<{
        value: string;
        label: string;
    }>;
}

const Select: React.FC<SelectProps> = ({custom_id, name, label, options, ...rest}) => {
    return (
        <div id={custom_id} className="select-block">
            <label htmlFor={name}>{label}</label>
            <select value="" id={name} {...rest}>
                <option value="" disabled hidden>-- Select an option --</option>
                {options.map(option => {
                    return <option key={option.value} value={option.value}>{option.label}</option>
                })}
            </select>
        </div>
    );
}

export default Select;