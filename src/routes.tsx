import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import DetailPage from "./pages/DetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export const routes = [
  {
    path: "/",
    name: "Главная",
    component: <HomePage />,
  },
  {
    path: "/explore",
    name: "Обзор",
    component: <ExplorePage />,
  },
  {
    path: "/detail/:id",
    name: "Детали",
    component: <DetailPage />,
  },
  {
    path: "/profile",
    name: "Профиль",
    component: <ProfilePage />,
  },
  {
    path: "*",
    name: "404",
    component: <NotFoundPage />,
  },
];
