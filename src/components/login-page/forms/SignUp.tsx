export default function SignupForm() {
  return (
    <form className = "flex flex-col gap-4">
      <input
        type = "text"
        placeholder = "Username"
      />

      <input
        type = "email"
        placeholder = "Email"
      />

      <input
        type = "password"
        placeholder = "Password"
      />

      <input
        type = "password"
        placeholder = "Confirm Password"
      />

      <button
        type = "submit"
      >
        Sign Up
      </button>
    </form>
  )
}
