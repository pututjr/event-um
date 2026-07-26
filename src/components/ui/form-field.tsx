import {
  errorTextClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "./styles";

export function TextField({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  disabled,
  placeholder,
  min,
  minLength,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        minLength={minLength}
        autoComplete={autoComplete}
        className={inputClass}
      />
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  rows = 3,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={textareaClass}
      />
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={selectClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
