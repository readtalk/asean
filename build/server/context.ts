import { createContext } from "react-router";

export const authContext = createContext<{
  userId: string;
  email: string;
}>();
