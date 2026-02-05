import { themeAtom } from "@/data/atoms";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Toaster as Sonner } from "sonner";
import { isDesktop } from "react-device-detect";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme] = useAtom(themeAtom);

  return (
    <Sonner
      duration={2000}
      position="top-left"
      swipeDirections={["bottom", "top"]}
      theme={theme as ToasterProps["theme"]}
      className=""
      style={{
        top: 120,
      }}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast !max-w-[calc(100vw-32px)] rounded-2xl backdrop-blur-md bg-card text-title shadow-lg px-4 py-2 mx-auto !self-center -translate-x-[16px]",
            !isDesktop && "top-40"
          ),
          title:
            "text-base font-medium whitespace-normal break-words text-start",
          description: "hidden",
          actionButton: "hidden",
          cancelButton: "hidden",
          success: "",
          error: "",
          info: "",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
