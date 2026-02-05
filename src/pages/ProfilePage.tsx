import React, { useState } from "react";
import {
  User,
  Moon,
  Sun,
  ChevronRight,
  Bell,
  Shield,
  Info,
} from "lucide-react";
import { useAtom } from "jotai";
import { themeAtom } from "@/data/atoms";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProfilePage = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full min-h-screen pb-4 px-4 md:px-6 space-y-6 md:space-y-8">
      {/* Карточка профиля */}
      <section>
        <ProfileCard
          name="Пользователь"
          email="user@example.com"
        />
      </section>

      {/* Демо-форма */}
      <section>
        <DemoForm />
      </section>

      {/* Настройки */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-title px-2">Настройки</h2>

        <div className="space-y-2">
          <ThemeToggleItem isDark={theme === "dark"} onToggle={toggleTheme} />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            label="Уведомления"
            subtitle="Управление уведомлениями"
            onClick={() => toast.info("Демо: открытие настроек уведомлений")}
          />
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            label="Конфиденциальность"
            subtitle="Настройки приватности"
            onClick={() => toast.info("Демо: открытие настроек приватности")}
          />
          <SettingItem
            icon={<Info className="w-5 h-5" />}
            label="О приложении"
            subtitle="TMA Шаблон v1.0.0"
            onClick={() => toast.info("TMA Шаблон v1.0.0")}
          />
        </div>
      </section>

      {/* Версия */}
      <section className="text-center space-y-2 pt-4">
        <p className="text-xs text-subaccent">TMA Шаблон v1.0.0</p>
      </section>
    </div>
  );
};

export default ProfilePage;

// --- Компоненты ---

interface ProfileCardProps {
  name: string;
  email: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email }) => {
  return (
    <div className="bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 shadow-s">
          <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate">
            {name}
          </h2>
          <p className="text-sm text-white/80 truncate">{email}</p>
        </div>
      </div>
    </div>
  );
};

// Демо-форма для демонстрации React Hook Form + валидации
const DemoForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Введите имя";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      toast.success(`Данные сохранены: ${formData.name}, ${formData.email}`);
      setFormData({ name: "", email: "" });
      setErrors({});
    }
  };

  return (
    <div className="bg-foreground rounded-2xl p-5 shadow-m space-y-4">
      <h3 className="text-lg font-bold text-title">Демо-форма</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="demo-name">Имя</Label>
          <div
            className="rounded-xl p-0.5"
            style={{ boxShadow: "var(--shadow-invert-s)" }}
          >
            <Input
              id="demo-name"
              placeholder="Введите ваше имя"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={cn("shadow-none", errors.name && "border-2 border-red-500")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-email">Email</Label>
          <div
            className="rounded-xl p-0.5"
            style={{ boxShadow: "var(--shadow-invert-s)" }}
          >
            <Input
              id="demo-email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={cn("shadow-none", errors.email && "border-2 border-red-500")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Сохранить
        </Button>
      </div>
    </div>
  );
};

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  subtitle,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-foreground shadow-m rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:bg-foreground-lighter active:scale-[0.98]"
    >
      <div className="flex-shrink-0 text-accent">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-title">{label}</p>
        {subtitle && (
          <p className="text-xs text-subaccent mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-subaccent flex-shrink-0" />
    </button>
  );
};

interface ThemeToggleItemProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggleItem: React.FC<ThemeToggleItemProps> = ({
  isDark,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="w-full bg-foreground shadow-m rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:bg-foreground-lighter active:scale-[0.98]"
    >
      <div className="flex-shrink-0 text-accent">
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-title truncate">Тема</p>
        <p className="text-xs text-subaccent mt-0.5 truncate">
          {isDark ? "Тёмная тема" : "Светлая тема"}
        </p>
      </div>
      <div
        className={`w-12 h-7 rounded-full p-1 transition-colors ${
          isDark ? "bg-accent" : "bg-subaccent/30"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
};
