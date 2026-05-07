import { useNavigate } from 'react-router-dom'
import './EditProjectPage.css'

const subscribers = [
    {
        id: 1,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=5',
    },
    {
        id: 2,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=6',
    },
    {
        id: 3,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=7',
    },
    {
        id: 4,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=8',
    },
]

function EditProjectPage() {
    const navigate = useNavigate()

    return (
        <main className="edit-project-page">
            <header className="edit-project-header">
                <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
                    ←
                </button>
                <h1>EditProject</h1>
            </header>

            <form className="edit-project-form">
                <section className="edit-project-card">
                    <label className="edit-project-field">
                        <span>Название проекта</span>
                        <input type="text" defaultValue="Женские встречи с заботой..." />
                    </label>

                    <div className="edit-project-age-row">
                        <label className="edit-project-field">
                            <span>Возраст от</span>
                            <input type="number" defaultValue={3} />
                        </label>

                        <label className="edit-project-field">
                            <span>Возраст до</span>
                            <input type="number" defaultValue={3} />
                        </label>
                    </div>
                </section>

                <section className="edit-project-card">
                    <label className="edit-project-field">
                        <span>Описание</span>
                        <textarea
                            rows={6}
                            defaultValue="Встречаемся, мажемся кремиками, массируем себя скребками, плавно потягиваемся и напитываемся нежностью."
                        />
                    </label>
                </section>

                <section className="edit-project-card">
                    <div className="edit-project-upload">
                        <div>
                            <span>Обложка проекта</span>
                            <strong>Загрузите изображение для карточки</strong>
                        </div>
                        <label>
                            Выбрать файл
                            <input type="file" accept="image/*" />
                        </label>
                    </div>
                </section>

                <section className="edit-project-card">
                    <h2>Место</h2>

                    <div className="edit-project-place-actions">
                        <button type="button">Выбрать на карте</button>
                        <button type="button">Перекресток</button>
                    </div>

                    <div className="edit-project-note">
                        <p>
                            Стоимость аренды зала 1000 рублей в час. У них три зала и только в одном можно
                            провести балет. Могут предоставить столы и стулья. Могут предоставить узкий гос
                            интернет.
                        </p>
                        <p>
                            Окончательное подтверждение времени необходимо производить по телефону:
                            <strong> 89265463465</strong>.
                        </p>
                    </div>
                </section>

                <section className="edit-project-card">
                    <h2>Подписчики</h2>

                    <div className="edit-project-subscribers">
                        {subscribers.map((subscriber) => (
                            <article className="edit-project-subscriber" key={subscriber.id}>
                                <img src={subscriber.image} alt={subscriber.name} />
                                <strong>{subscriber.name}</strong>
                                <span>{subscriber.age}</span>
                            </article>
                        ))}
                    </div>
                </section>

                <button className="edit-project-save" type="submit">
                    Сохранить изменения
                </button>
            </form>
        </main>
    )
}

export default EditProjectPage