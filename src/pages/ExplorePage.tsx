import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn, useDebounce, useDirectionalLink } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Демо-данные (замените на useGetPosts или свой хук)
const DEMO_ITEMS = [
  {
    id: 1,
    title: "Начало работы с TMA",
    description: "Как настроить Telegram Mini App с нуля",
    tag: "Документация",
  },
  {
    id: 2,
    title: "React Query: кеширование",
    description: "Автоматическое управление серверным состоянием",
    tag: "API",
  },
  {
    id: 3,
    title: "Тёмная тема",
    description: "Реализация через CSS-переменные и Jotai",
    tag: "UI",
  },
  {
    id: 4,
    title: "Анимации переходов",
    description: "Framer Motion для плавной навигации",
    tag: "Анимация",
  },
  {
    id: 5,
    title: "Генератор API кода",
    description: "Автоматическая генерация типов из Swagger",
    tag: "Инструменты",
  },
  {
    id: 6,
    title: "ShadCN компоненты",
    description: "Готовые UI компоненты с Tailwind CSS",
    tag: "UI",
  },
  {
    id: 7,
    title: "Валидация форм",
    description: "React Hook Form + Zod для безопасных форм",
    tag: "Формы",
  },
  {
    id: 8,
    title: "Docker деплой",
    description: "Многоступенчатая сборка для продакшена",
    tag: "DevOps",
  },
];

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigateDirectional = useDirectionalLink();

  const filteredItems = useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    return DEMO_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query)
    );
  }, [debouncedQuery]);

  return (
    <div className="w-full min-h-screen pb-4 px-4 md:px-6 space-y-4 md:space-y-6">
      {/* Заголовок */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-title mb-4">
          Обзор
        </h1>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subaccent" />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-foreground border-none shadow-m rounded-xl"
          />
        </div>
      </section>

      {/* Список элементов */}
      <section className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-subaccent text-sm">Ничего не найдено</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ExploreCard
              key={item.id}
              title={item.title}
              description={item.description}
              tag={item.tag}
              onClick={() =>
                navigateDirectional(`/detail/${item.id}`, "right")
              }
            />
          ))
        )}
      </section>

      {/* Счётчик результатов */}
      <section className="text-center">
        <p className="text-xs text-subaccent">
          Показано {filteredItems.length} из {DEMO_ITEMS.length}
        </p>
      </section>
    </div>
  );
};

export default ExplorePage;

// --- Компоненты ---

interface ExploreCardProps {
  title: string;
  description: string;
  tag: string;
  onClick?: () => void;
}

const ExploreCard: React.FC<ExploreCardProps> = ({
  title,
  description,
  tag,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-foreground rounded-2xl p-4 md:p-5 cursor-pointer",
        "shadow-m transition-all",
        "hover:scale-[1.01] active:scale-[0.99]"
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-title mb-1 truncate">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-subaccent line-clamp-2">
            {description}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium bg-accent/10 text-accent flex-shrink-0">
          {tag}
        </span>
      </div>
    </div>
  );
};
