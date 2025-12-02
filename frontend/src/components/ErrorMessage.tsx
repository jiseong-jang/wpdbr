interface ErrorMessageProps {
  message: string
  onClose?: () => void
}

const ErrorMessage = ({ message, onClose }: ErrorMessageProps) => {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#fee',
      color: '#c33',
      borderRadius: '4px',
      margin: '1rem 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#c33',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 0.5rem'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default ErrorMessage

