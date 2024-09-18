import { Toaster } from "react-hot-toast";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};
export default AppProvider;
