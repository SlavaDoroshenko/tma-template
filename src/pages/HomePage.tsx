import React from "react";
import { Search, Users, FileText, Settings } from "lucide-react";
import { cn, useDirectionalLink } from "@/lib/utils";

const HomePage = () => {
  const navigateDirectional = useDirectionalLink();

  return (
    <div className="w-full min-h-screen pb-4 px-4 md:px-6 space-y-6 md:space-y-8">
      {/* Приветствие */}
      <section className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-title">
          TMA Шаблон
        </h1>
        <p className="text-sm text-subaccent">
          Готовый шаблон для Telegram Mini App
        </p>
      </section>

      {/* Быстрые действия */}
      <section className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-title">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3 md:grid-cols-4">
          <QuickActionCard
            icon={<Search className="w-7 h-7 md:w-8 md:h-8" />}
            title="Обзор"
            subtitle="Список элементов"
            onClick={() => navigateDirectional("/explore", "right")}
          />
          <QuickActionCard
            icon={<Users className="w-7 h-7 md:w-8 md:h-8" />}
            title="Профиль"
            subtitle="Настройки"
            onClick={() => navigateDirectional("/profile", "right")}
          />
          <QuickActionCard
            icon={<FileText className="w-7 h-7 md:w-8 md:h-8" />}
            title="Детали"
            subtitle="Пример страницы"
            onClick={() => navigateDirectional("/detail/1", "right")}
          />
          <QuickActionCard
            icon={<Settings className="w-7 h-7 md:w-8 md:h-8" />}
            title="Настройки"
            subtitle="Конфигурация"
            onClick={() => navigateDirectional("/profile", "right")}
          />
        </div>
      </section>

      {/* Информационные карточки */}
      <section className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-title">
          Возможности шаблона
        </h2>
        <div className="space-y-3">
          <InfoCard
            title="React Query"
            description="Автоматическое кеширование запросов, повторные попытки и синхронизация данных"
          />
          <InfoCard
            title="Анимированные переходы"
            description="Плавные переходы между страницами с помощью Framer Motion"
          />
          <InfoCard
            title="Telegram интеграция"
            description="Кнопка 'назад', полноэкранный режим, авторизация через TMA токен"
          />
          <InfoCard
            title="Тёмная тема"
            description="Поддержка светлой и тёмной темы через CSS-переменные"
          />
          <InfoCard
            title="ShadCN UI"
            description="Готовые компоненты: кнопки, формы, диалоги, карточки и другие"
          />
          <InfoCard
            title="Генератор API"
            description="Скрипт для генерации типов, запросов и хуков из Swagger/OpenAPI"
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;

// --- Компоненты ---

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  subtitle,
  onClick,
}) => {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-2xl md:rounded-3xl p-3.5 md:p-4",
        "flex flex-col items-start justify-between min-h-[120px] md:min-h-[140px]",
        "transition-transform",
        "shadow-m",
        "bg-foreground text-title",
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <div className="mb-auto w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div className="text-left w-full min-w-0">
        <h3 className="font-semibold text-sm md:text-base leading-tight mb-0.5 md:mb-1 truncate">
          {title}
        </h3>
        <p className="text-[10px] md:text-xs opacity-70 truncate">{subtitle}</p>
      </div>
    </button>
  );
};

interface InfoCardProps {
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description }) => {
  return (
    <div className="bg-foreground rounded-2xl md:rounded-3xl p-4 md:p-5 space-y-2 shadow-m">
      <h3 className="text-base md:text-lg font-bold text-title">{title}</h3>
      <p className="text-xs md:text-sm text-subaccent">{description}</p>
    </div>
  );
};
