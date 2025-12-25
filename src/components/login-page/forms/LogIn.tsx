export default function LoginForm() {
  return (
    <form className = "flex flex-col gap-4">
      <input
        type = "email"
        placeholder = "Email"
      />

      <input
        type = "password"
        placeholder = "Password"
      />

      <button
        type = "submit"
      >
        Log In
      </button>
    </form>
  )
}
