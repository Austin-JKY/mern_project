import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api";

interface RegisterUserResponse {
  status: string;
  token: string;
  data: {
    user: {
      username: string;
      email: string;
      _id: string;
      createdAt: string;
    };
  };
}

interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export function useAuth() {
  return useMutation<RegisterUserResponse, Error, RegisterUserInput>({
    mutationFn: (userData) => apiRequest("/users/signup", "POST", userData),
  });
}