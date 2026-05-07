import { Link, useNavigate } from 'react-router-dom'
import './ProjectPage.css'

function ProjectPage() {
  const navigate = useNavigate()

  const participants = [
    'https://i.pravatar.cc/80?img=1',
    'https://i.pravatar.cc/80?img=2',
    'https://i.pravatar.cc/80?img=3',
    'https://i.pravatar.cc/80?img=4',
  ]

  const schedule = [
    {
      id: 1,
      date: '17 ноября',
      time: '15:00',
      places: 45,
    },
    {
      id: 2,
      date: '17 ноября',
      time: '15:00',
      places: 45,
    },
    {
      id: 3,
      date: '17 ноября',
      time: '15:00',
      places: 45,
    },
  ]

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
            {participants.map((participant) => (
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
            {schedule.map((slot) => (
              <article className="schedule-card" key={slot.id}>
                <div>
                  <span className="schedule-label">Дата</span>
                  <strong>{slot.date}</strong>
                </div>
                <div>
                  <span className="schedule-label">Время</span>
                  <strong>{slot.time}</strong>
                </div>
                <div>
                  <span className="schedule-label">Мест</span>
                  <strong>{slot.places}</strong>
                </div>
                <button type="button">Участвовать</button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default ProjectPage
