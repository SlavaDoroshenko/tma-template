import { useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { useDirectionalLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Демо-данные (замените на useGetPostById или свой хук)
const DEMO_DETAILS: Record<
  string,
  { title: string; body: string; author: string; date: string; tags: string[] }
> = {
  "1": {
    title: "Начало работы с TMA",
    body: "Telegram Mini Apps (TMA) — это веб-приложения, которые запускаются внутри Telegram. Они имеют доступ к API Telegram, включая авторизацию пользователя, платежи и haptic feedback.\n\nДля начала работы:\n1. Создайте бота через @BotFather\n2. Настройте WebApp URL\n3. Используйте Telegram WebApp JS SDK для интеграции\n\nЭтот шаблон уже содержит всю необходимую настройку — вам остаётся только подключить свой API.",
    author: "Разработчик",
    date: "2024-01-15",
    tags: ["TMA", "Telegram", "Начало"],
  },
  "2": {
    title: "React Query: кеширование",
    body: "TanStack React Query автоматически управляет серверным состоянием. В этом шаблоне каждый GET-эндпоинт оборачивается в useQuery, а POST/PATCH/DELETE — в useMutation.\n\nОсновные преимущества:\n- Автоматическое кеширование (staleTime: 5 минут)\n- Повторные попытки при ошибках\n- Инвалидация кеша после мутаций\n- Отображение состояния загрузки/ошибки",
    author: "Архитектор",
    date: "2024-01-20",
    tags: ["API", "React Query", "Кеширование"],
  },
  "3": {
    title: "Тёмная тема",
    body: "Тема управляется через Jotai атом (themeAtom) и CSS-переменные. При переключении темы меняется data-атрибут на html элементе, и все цвета обновляются через CSS-переменные.\n\nТема сохраняется в localStorage и восстанавливается при следующем запуске. Инициализация происходит в index.html до загрузки React, чтобы избежать мигания.",
    author: "Дизайнер",
    date: "2024-02-01",
    tags: ["UI", "Тема", "CSS"],
  },
};

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigateDirectional = useDirectionalLink();

  const detail = id ? DEMO_DETAILS[id] : null;

  if (!detail) {
    return (
      <div className="w-full min-h-screen pb-4 px-4 md:px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-subaccent">Элемент не найден</p>
          <Button onClick={() => navigateDirectional("/explore", "left")}>
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-4 px-4 md:px-6 space-y-6">
      {/* Кнопка назад */}
      <button
        onClick={() => navigateDirectional("/explore", "left")}
        className="flex items-center gap-2 text-accent hover:text-accent-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Назад</span>
      </button>

      {/* Заголовок */}
      <section className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-title">
          {detail.title}
        </h1>

        <div className="flex flex-wrap gap-3 text-xs text-subaccent">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{detail.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{detail.date}</span>
          </div>
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-2">
          {detail.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium bg-accent/10 text-accent"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Содержимое */}
      <section className="bg-foreground rounded-2xl p-5 shadow-m">
        <div className="whitespace-pre-line text-sm md:text-base text-title leading-relaxed">
          {detail.body}
        </div>
      </section>

      {/* Действие */}
      <section className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => navigateDirectional("/explore", "left")}
        >
          Вернуться к списку
        </Button>
      </section>
    </div>
  );
};

export default DetailPage;
