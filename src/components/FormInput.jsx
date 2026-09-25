// src/components/FormInput.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  helperText,
  icon: Icon,
  className = '',
  inputClassName = '',
  rows = 3,
  options = [], // For select inputs: [{ value, label }] or ['Option 1', 'Option 2']
  autoComplete,
  id,
  min,
  max,
  step,
  ...props
}) => {
  const inputId = id || name;

  const baseInputStyles = `w-full rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
    readOnly ? 'bg-slate-50 text-slate-800 border-slate-200 cursor-default' : ''
  } ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20'
      : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/20 text-slate-900 bg-white'
  } ${Icon ? 'pl-10' : 'px-3.5'} py-2.5`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={rows}
            className={`${baseInputStyles} ${inputClassName}`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${inputClassName} appearance-none pr-8 cursor-pointer bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => {
              const optValue = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={idx} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            className={`${baseInputStyles} ${inputClassName}`}
            {...props}
          />
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
