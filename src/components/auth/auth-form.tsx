"use client"

import { useActionState } from "react"
import { login, signup } from "../../app/auth/actions"

const initialState = {
  error: "",
  success: false
}

export function AuthForm() {
  const [loginState, loginAction, isLoginPending] = useActionState(login, initialState)
  const [signupState, signupAction, isSignupPending] = useActionState(signup, initialState)

  return (
    <div className = "flex flex-col gap-8 max-w-md w-full mx-auto p-6 border rounded-lg shadow-sm">
      <form action = { loginAction } className = "flex flex-col gap-4">
        <h2 className = "text-xl font-bold">Login</h2>

        <input
          name = "email"
          type = "email"
          placeholder = "email@example.com"
          required
          className = "p-2 border rounded"
        />

        <input
          name = "password"
          type = "password"
          placeholder = "Password"
          required
          className = "p-2 border rounded"
        />

        {loginState?.error && (
          <p className = "text-red-500 text-sm">{loginState.error}</p>
        )}

        <button
          type = "submit"
          disabled = { isLoginPending }
          className = "bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoginPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className = "h-px bg-gray-200 w-full" />

      <form action = { signupAction } className = "flex flex-col gap-4">
        <h2 className = "text-xl font-bold">Sign Up</h2>

        <input
          name = "username"
          type = "text"
          placeholder = "Username"
          required
          className = "p-2 border rounded"
        />

        <input
          name = "email"
          type = "email"
          placeholder = "email@example.com"
          required
          className = "p-2 border rounded"
        />

        <input
          name = "password"
          type = "password"
          placeholder = "Password"
          required
          className = "p-2 border rounded"
        />

        <input
          name = "confirmPassword"
          type = "password"
          placeholder = "Confirm Password"
          required
          className = "p-2 border rounded"
        />

        {signupState?.error && (
          <p className = "text-red-500 text-sm">{signupState.error}</p>
        )}

        <button
          type = "submit"
          disabled = {isSignupPending}
          className = "bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSignupPending ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  )
}
