interface InlineErrorProps {
  message: string
  id?: string
}

export function InlineError({ message, id }: InlineErrorProps) {
  return (
    <p role="alert" id={id} className="inline-error">
      {message}
    </p>
  )
}
