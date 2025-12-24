type IconProps = {
  className?: string
}

export function IconCode({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" />
    </svg>
  )
}

export function IconPlay({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m160-800 80 160h120l-80-160h80l80 160h120l-80-160h80l80 160h120l-80-160h120q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Zm0 240v320h640v-320H160Zm0 0v320-320Z" />
    </svg>
  )
}
