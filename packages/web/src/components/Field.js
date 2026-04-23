import styled from 'styled-components';

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
    <Wrapper>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        $hasError={!!error}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Wrapper>
  );
}

const Wrapper = styled.label`
  display: grid;
  gap: 8px;
  width: 100%;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.light};
  font-size: 0.95rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.colors.danger : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.25);
  color: ${({ theme }) => theme.colors.light};
  outline: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 2px rgba(240, 208, 100, 0.1);
  }
`;

const ErrorText = styled.small`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;