import {useEffect, useState} from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import ProjectPage from './ProjectPage'
import EditProjectPage from './EditProjectPage'
import PlaceSelectPage from './PlaceSelectPage'
import './App.css'
import type { Project } from './types'
import { useQuery } from '@tanstack/react-query'
import {apiFetch} from "./api.ts";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const ACCESS_TOKEN_STORAGE_KEY = 'access_token'

function saveAccessTokenFromUrl() {
    if (typeof window === 'undefined') {
        return null
    }

    const url = new URL(window.location.href)
    const accessToken = url.searchParams.get('access_token')

    if (!accessToken) {
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    url.searchParams.delete('access_token')
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)

    return accessToken
}

async function fetchProjects(): Promise<Project[]> {
    return apiFetch<Project[]>('/projects')
}

const authStrategies = [
    {
        title: 'Google',
        href: `${API_URL}/login/google`,
        icon: 'G',
    },
    // {
    //     title: 'Mail.ru',
    //     href: `${API_URL}/login/mailru`,
    //     icon: '@',
    // },
    {
        title: 'Yandex',
        href: `${API_URL}/login/yandex`,
        icon: 'Я',
    },
    // {
    //     title: 'VK',
    //     href: `${API_URL}/login/vkontakte`,
    //     icon: 'VK',
    // },
]

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    useEffect(() => {
        setAccessToken(saveAccessTokenFromUrl())
    }, [])

    const {
        data: projects = [],
        isLoading: isProjectsLoading,
        isError: isProjectsError,
    } = useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
        enabled: accessToken !== null,
    })

    console.log(projects,'projects')

  return (
    <>
      <header className="home-header">
        <button
          className="home-header-menu-button"
          type="button"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((isMenuOpen) => !isMenuOpen)}
        >
          {isMenuOpen ? '×' : '☰'}
        </button>

        <div className="home-header-user">
          <img
              src="https://i.pravatar.cc/120?img=5"
              alt="Настя Галкина"
          />
          <span>Настя Галкина</span>
        </div>

        <div className="home-header-ai-actions" aria-label="Общение с АИ">
          <button type="button" aria-label="Чат с АИ">
            🤖
          </button>
          <button type="button" aria-label="Голосовой помощник">
            🎙️
          </button>
          <button type="button" aria-label="Идеи от АИ">
            ✨
          </button>
        </div>
      </header>

        <section className="auth-section" aria-labelledby="auth-section-title">
            <div className="auth-section-content">
                <div>
                    <h2 id="auth-section-title">
                        {accessToken ? 'Вы авторизованы' : 'Войти в аккаунт'}
                    </h2>
                    <p>
                        {accessToken ? 'Теперь доступны защищённые разделы' : 'Выберите удобный способ авторизации'}
                    </p>
                </div>

                {accessToken ? (
                    <button
                        className="auth-strategy"
                        type="button"
                        onClick={() => {
                            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
                            setAccessToken(null)
                        }}
                    >
                        <span className="auth-strategy-icon">×</span>
                        <span>Выйти</span>
                    </button>
                ) : (
                    <div className="auth-strategies">
                        {authStrategies.map((strategy) => (
                            <a
                                className="auth-strategy"
                                href={strategy.href}
                                key={strategy.title}
                            >
                                <span className="auth-strategy-icon">{strategy.icon}</span>
                                <span>{strategy.title}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
      {isMenuOpen && (
        <section className="home-menu">
          <header className="home-menu-header">
            <div className="home-menu-logo">Menu</div>

            <div className="home-menu-profile">
              <img
                  src="https://i.pravatar.cc/120?img=5"
                  alt="Настя Галкина"
              />
              <div>
                <strong>Настя Галкина</strong>
                <span>10 лет</span>
              </div>
            </div>
          </header>

          <div className="home-menu-list">
            <button className="home-menu-item home-menu-item-primary" type="button">
              <span className="home-menu-icon">+</span>
              <span>Новая идея</span>
            </button>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">💡</span>
              <span>Мои проекты и идеи</span>
            </Link>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">📅</span>
              <span>Календарь</span>
            </Link>
          </div>

          <div className="home-menu-footer">
            <button className="home-menu-item home-menu-item-primary" type="button">
              <span className="home-menu-icon">+</span>
              <span>Новый проект</span>
            </button>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">📁</span>
              <span>Мои проекты</span>
            </Link>
          </div>
        </section>
      )}

      <section className="projects-section">
        <h2>Проекты</h2>

          {isProjectsLoading && <p>Загрузка проектов...</p>}
          {isProjectsError && <p>Не удалось загрузить проекты.</p>}

          {!isProjectsLoading && !isProjectsError && (
          <div className="projects-grid">
          {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <img src={project.image || ''} alt={project.title || ''} />
                <div className="project-card-content">
                  <h3>{project.title} 2</h3>
                  <p>{project.description}</p>
                  <Link to={`/project/${project.id}`}>Подробнее</Link>
                </div>
              </article>
          ))}
        </div>
      )}
      </section>
    </>
  )
}


function NotFoundPage() {
  return (
      <section id="center">
        <h1 className="text-3xl font-bold text-red-600">404</h1>
        <p>Страница не найдена.</p>
      </section>
  )
}

function App() {
  return (
      <>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/1" element={<ProjectPage />} />
          <Route path="/project/1/edit" element={<EditProjectPage/>} />
          <Route path="/project/1/edit/place" element={<PlaceSelectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </>
  )
}

export default App