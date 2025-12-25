type IconProps = {
  className?: string
}

export default function IconGoBack({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
    </svg>
  )
}
