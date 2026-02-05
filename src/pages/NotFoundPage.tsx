import { useDirectionalLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigateDirectional = useDirectionalLink();

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-accent">404</h1>
        <p className="text-lg text-title font-medium">Страница не найдена</p>
        <p className="text-sm text-subaccent">
          Запрашиваемая страница не существует или была удалена
        </p>
        <Button onClick={() => navigateDirectional("/", "left")}>
          На главную
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
