"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

interface FromData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const SignUp = () => {
  const [formData, setFormData] = React.useState<FromData>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log(formData);
  };
  return (
    <div className="flex lg:flex-row md:flex:row min-h-screen bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
      <div
        className="w-full lg:w-1/2 bg-cover bg-center h-[40vh] lg:h-full"
        style={{ backgroundImage: "url('/path/to/your/image.jpg')" }}
      ></div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 p-6 lg:p-16 bg-white flex justify-center items-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Sign up</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign up for free to access any of our products
          </p>

          <form>
            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="text-sm text-gray-600">
                Username
              </label>
              <Input
                name="username"
                title="Username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="text-sm text-gray-600">
                Email address
              </label>
              <Input
              name="email"
                title="Email address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="text-sm text-gray-600">
                Password
              </label>
              <Input
                name="password"
                title="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirm-password"
                className="text-sm text-gray-600"
              >
                Confirm Password
              </label>
              <Input
                name="passwordConfirm"
                title="Password"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="Enter your confirm password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            {/* Checkboxes */}
            <div className="flex flex-col space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="form-checkbox text-indigo-600"
                />
                <label htmlFor="terms" className="ml-2 text-gray-600">
                  Agree to our{" "}
                  <a href="#" className="text-indigo-600">
                    Terms of use
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <div className="flex items-center text-sm">
                <input
                  type="checkbox"
                  id="newsletter"
                  className="form-checkbox text-indigo-600"
                />
                <label htmlFor="newsletter" className="ml-2 text-gray-600">
                  Subscribe to our monthly newsletter
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Sign up
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
