/**
 * All user-facing UI strings live here (Russian). Components must not
 * hardcode text — import from this file so copy stays in one place.
 */
export const strings = {
  app: {
    name: "Pathway",
  },
  nav: {
    dashboard: "Дашборд",
    profile: "Профиль",
    universities: "Университеты",
    roadmap: "План",
    tasks: "Задачи",
    agent: "Агент",
    signOut: "Выйти",
  },
  landing: {
    title: "Pathway",
    tagline:
      "Поступление в университет — это план, а не догадка. Pathway строит его для тебя.",
    howItWorksTitle: "Как это работает",
    steps: [
      {
        title: "Расскажи о себе",
        description:
          "Оценки, экзамены, интересы и страны, куда хочешь поступать.",
      },
      {
        title: "Получи подбор вузов",
        description:
          "Dream, target и safety варианты на основе реальных требований.",
      },
      {
        title: "Следуй плану",
        description:
          "Еженедельные задачи и трекер, чтобы не пропустить дедлайны.",
      },
    ],
    ctaStart: "Начать",
    ctaLogin: "Войти",
  },
  auth: {
    login: {
      title: "Вход",
      subtitle: "Войдите в свой аккаунт Pathway",
      emailLabel: "Email",
      passwordLabel: "Пароль",
      submit: "Войти",
      submitting: "Входим…",
      noAccount: "Нет аккаунта?",
      signupLink: "Зарегистрироваться",
    },
    signup: {
      title: "Регистрация",
      subtitle: "Создайте аккаунт, чтобы начать путь к поступлению",
      fullNameLabel: "Имя и фамилия",
      emailLabel: "Email",
      passwordLabel: "Пароль",
      submit: "Зарегистрироваться",
      submitting: "Создаём аккаунт…",
      haveAccount: "Уже есть аккаунт?",
      loginLink: "Войти",
    },
    errors: {
      invalidCredentials: "Неверный email или пароль.",
      emailAlreadyRegistered: "Этот email уже зарегистрирован.",
      weakPassword: "Пароль слишком простой. Используйте минимум 8 символов.",
      network:
        "Не удалось связаться с сервером. Проверьте подключение к интернету и попробуйте снова.",
      generic: "Что-то пошло не так. Попробуйте снова.",
      fullNameRequired: "Введите имя и фамилию.",
      emailInvalid: "Введите корректный email.",
      passwordMin: "Пароль должен содержать минимум 8 символов.",
    },
  },
  dashboard: {
    greeting: (name: string) => `Привет, ${name}`,
    onboardingDone: "Онбординг завершён",
    onboardingPending: "Онбординг не завершён",
    onboardingCta: "Пройти онбординг",
  },
  placeholders: {
    onboarding: {
      title: "Онбординг",
      description: "Здесь скоро появится анкета с вашими данными.",
    },
    profile: {
      title: "Профиль",
      description: "Здесь будет ваш профиль и CV.",
    },
    universities: {
      title: "Университеты",
      description: "Здесь появится подбор университетов.",
    },
    roadmap: {
      title: "План",
      description: "Здесь появится еженедельный план подготовки.",
    },
    tasks: {
      title: "Задачи",
      description: "Здесь появится трекер задач.",
    },
    agentPanel: {
      title: "AI-агент",
      description: "Скоро здесь появится помощник по поступлению.",
    },
  },
  errorPage: {
    title: "Что-то пошло не так",
    description: "Произошла непредвиденная ошибка. Попробуйте ещё раз.",
    retry: "Попробовать снова",
    backHome: "На главную",
  },
  notFoundPage: {
    title: "Страница не найдена",
    description: "Такой страницы не существует или она была перемещена.",
    backHome: "На главную",
  },
} as const;
