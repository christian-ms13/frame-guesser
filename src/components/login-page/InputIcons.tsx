type IconProps = {
  className?: string
}

export function IconUsername({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-200-60q25 0 42.5-17.5T420-420q0-25-17.5-42.5T360-480q-25 0-42.5 17.5T300-420q0 25 17.5 42.5T360-360Zm200-60h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z" />
    </svg>
  )
}

export function IconCheckmark({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
  )
}

export function IconLoading({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z" />
    </svg>
  )
}

export function IconUnavailableUsername({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z" />
    </svg>
  )
}

export function IconEmail({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
    </svg>
  )
}

export function IconEmailUnavailable({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M383-463Zm194-34ZM791-55 686-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800l80 80h-80v480h446L55-791l57-57 736 736-57 57Zm80-148-71-71v-366L575-499l-49-49 274-172H354l-80-80h526q33 0 56.5 23.5T880-720v480q0 10-2 19.5t-7 17.5Z" />
    </svg>
  )
}

export function IconNotValidField({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M819-28 701-146q-48 32-103.5 49T480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-62 17-117.5T146-701L27-820l57-57L876-85l-57 57ZM480-160q45 0 85.5-12t76.5-33L487-360l-63 64-170-170 56-56 114 114 7-8-226-226q-21 36-33 76.5T160-480q0 133 93.5 226.5T480-160Zm335-100-59-59q21-35 32.5-75.5T800-480q0-133-93.5-226.5T480-800q-45 0-85.5 11.5T319-756l-59-59q48-31 103.5-48T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 61-17 116.5T815-260ZM602-474l-56-56 104-104 56 56-104 104Zm-64-64ZM424-424Z" />
    </svg>
  )
}

export function IconPassword({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" />
    </svg>
  )
}

export function IconShowPassword({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
    </svg>
  )
}

export function IconHidePassword({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
    </svg>
  )
}

export function IconConfirmPassword({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M655-200 513-342l56-56 85 85 170-170 56 57-225 226Zm0-320L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z"/>
    </svg>
  )
}

export function IconConfirmPasswordBefore({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z" />
    </svg>
  )
}

export function IconConfirmPasswordCorrect({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
    </svg>
  )
}

export function IconConfirmPasswordNotMatching({ className }: IconProps) {
  return (
    <svg xmlns = "http://www.w3.org/2000/svg" viewBox = "0 -960 960 960" fill = "currentColor" className = {className}>
      <path d = "m576-160-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm79-360L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z" />
    </svg>
  )
}
