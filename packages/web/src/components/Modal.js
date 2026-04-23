import styled from 'styled-components';

export default function Modal({ type = 'info', title, message, onClose }) {
  return (
    <Backdrop onClick={onClose}>
      <Dialog role="dialog" onClick={(event) => event.stopPropagation()}>
        <Badge $type={type}>{title || 'Aviso'}</Badge>
        <p>{message}</p>
        <CloseButton type="button" onClick={onClose}>
          Fechar
        </CloseButton>
      </Dialog>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(11, 19, 37, 0.8);
  backdrop-filter: blur(6px);
  padding: 24px;
  z-index: 1000;
`;

const Dialog = styled.div`
  width: min(420px, 100%);
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.light};
  padding: 32px;
  box-shadow: ${({ theme }) => theme.shadows.hover};
  text-align: center;

  p {
    line-height: 1.6;
    margin-top: 16px;
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

const Badge = styled.strong`
  display: inline-flex;
  margin-bottom: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  background: ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.success
      : $type === 'error'
        ? theme.colors.danger
        : theme.colors.primary};
  color: ${({ $type }) => $type === 'success' || $type === 'error' ? '#fff' : '#000'};
`;

const CloseButton = styled.button`
  margin-top: 24px;
  border: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: #000;
  font-weight: bold;
  padding: 12px 32px;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
`;