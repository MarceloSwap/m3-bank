export default function Modal({ type = 'info', title, message, onClose, actions = [] }) {
  const hasActions = actions.length > 0;

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal__dialog" role="dialog" onClick={(event) => event.stopPropagation()}>
        <h2 className={`modal__badge modal__badge--${type}`}>{title || 'Aviso'}</h2>
        <p>{message}</p>
        {hasActions ? (
          <div className="modal__actions">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`modal__action modal__action--${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : (
          <button className="modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
