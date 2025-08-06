import { useEffect } from "react";
import { toast, ToastContainer, ToastOptions, ToastPosition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToasterProps {
  show: boolean;
  title: string;
  toastType?: "success" | "failure" | "info" | "warning" | "default";
  position?: ToastPosition;
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number | string;
  theme?: "light" | "dark" | "colored";
  rtl?: boolean;
  closeButton: () => void;
}

const Toaster: React.FC<ToasterProps> = ({
  show,
  title,
  toastType = "default",
  position = "top-right",
  autoClose = 2000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = true,
  progress,
  theme = "dark",
  rtl = false,
  closeButton,
}) => {
  useEffect(() => {
    if (show) {
      const commonOptions: ToastOptions = {
        position,
        autoClose,
        hideProgressBar,
        closeOnClick,
        pauseOnHover,
        draggable,
        // progress,
        theme,
        rtl,
        onClose: () => closeButton(),
      };

      switch (toastType) {
        case "success":
          toast.success(title, commonOptions);
          break;
        case "failure":
          toast.error(title, commonOptions);
          break;
        case "info":
          toast.info(title, commonOptions);
          break;
        case "warning":
          toast.warn(title, commonOptions);
          break;
        default:
          toast(title, commonOptions);
          break;
      }
    }
  }, [
    show,
    title,
    toastType,
    position,
    autoClose,
    hideProgressBar,
    closeOnClick,
    pauseOnHover,
    draggable,
    progress,
    theme,
    rtl,
    closeButton,
  ]);

  return <ToastContainer />;
};

export default Toaster;
