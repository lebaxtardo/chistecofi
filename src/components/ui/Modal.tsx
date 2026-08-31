import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function Modal({ open, title, children, actions }: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <div className="modal-body">{children}</div>
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>
  )
}
