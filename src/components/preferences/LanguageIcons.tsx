type IconProps = {
  className?: string
}

export function IconUS({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M240-280q-33 0-56.5-23.5T160-360v-320h80v320h120v-320h80v320q0 33-23.5 56.5T360-280H240Zm360 0q-33 0-56.5-23.5T520-360v-40h80v40h120v-80H600q-33 0-56.5-23.5T520-520v-80q0-33 23.5-56.5T600-680h120q33 0 56.5 23.5T800-600v40h-80v-40H600v80h120q33 0 56.5 23.5T800-440v80q0 33-23.5 56.5T720-280H600Z" />
    </svg>
  )
}

export function IconES({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M600-280q-33 0-56.5-23.5T520-360v-40h80v40h120v-80H600q-33 0-56.5-23.5T520-520v-80q0-33 23.5-56.5T600-680h120q33 0 56.5 23.5T800-600v40h-80v-40H600v80h120q33 0 56.5 23.5T800-440v80q0 33-23.5 56.5T720-280H600ZM160-680h280v80H240v80h160v80H240v80h200v80H160v-400Z" />
    </svg>
  )
}
