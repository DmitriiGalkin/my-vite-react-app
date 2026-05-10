import { Link, useNavigate } from 'react-router-dom'
import './ProjectPage.css'
import { meetings } from './mocks'
import {useEffect} from "react";

function ProjectPage() {
  const navigate = useNavigate()

  const userImages = [
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/65.jpg',
    'https://randomuser.me/api/portraits/men/45.jpg',
  ]

  useEffect(() => {
    document.title = "Эпоксидная смола"
  }, [])

  return (
    <main className="project-page">
      <button className="project-page-back" type="button" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <Link className="project-page-edit" to="/project/1/edit">
        Редактировать
      </Link>

      <img
        className="project-page-image"
        src="https://thumbs.dreamstime.com/z/none-165853060.jpg"
        alt="Эпоксидная смола"
      />

      <section className="project-page-content">
        <h1>Эпоксидная смола</h1>

        <p className="project-page-description">
          Изготовление изделий из эпоксидной смолы, изучение различных техник заливки, форм,
          цветов, текстур.
        </p>

        <div className="participants">
          <div className="participants-avatars">
            {userImages.map((participant) => (
              <img src={participant} alt="Участник" key={participant} />
            ))}
            <span className="participants-more">+5</span>
          </div>
        </div>

        <div className="project-info">
          <div className="project-info-item">
            <span>Место</span>
            <strong>Лесной дом</strong>
          </div>
          <div className="project-info-item">
            <span>Возраст</span>
            <strong>5-7 лет</strong>
          </div>
          <div className="project-info-item">
            <span>Организатор</span>
            <strong>Галкин Дмитрий</strong>
          </div>
        </div>

        <section className="schedule">
          <h2>Расписание</h2>

          <div className="schedule-list">
            {meetings
                .filter((meeting) => !meeting.deletedAt)
                .map((meeting) => {
                  const startedAt = new Date(meeting.startedAt)

                  return (
                      <article className="schedule-card" key={meeting.id}>
                        <div>
                          <span className="schedule-label">Дата</span>
                          <strong>
                            {startedAt.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </strong>
                        </div>
                        <div>
                          <span className="schedule-label">Время</span>
                          <strong>
                            {startedAt.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </div>
                        <div>
                          <span className="schedule-label">Цена</span>
                          <strong>{meeting.price ? `${meeting.price} ₽` : 'Бесплатно'}</strong>
                        </div>
                        <button type="button">Участвовать</button>
                      </article>
                  )
                })}
          </div>
        </section>
      </section>
    </main>
  )
}

export default ProjectPage
