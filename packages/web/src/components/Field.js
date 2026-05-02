export default function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  inputMode
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className={`field__input${error ? ' field__input--error' : ''}`}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {error ? <small className="field__error">{error}</small> : null}
    </label>
  );
}
