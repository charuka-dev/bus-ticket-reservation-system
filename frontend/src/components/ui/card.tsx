import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        borderRadius: 16,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "#fff",
        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
        ...style,
      }}
      {...props}
    />
  ),
)
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ padding: 24, ...style }}
      {...props}
    />
  ),
)
CardContent.displayName = "CardContent"

export { Card, CardContent }
