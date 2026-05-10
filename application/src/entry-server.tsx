import React from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import {StaticRouter} from "react-router-dom";

type PageMeta = {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    ogType: string
    ogSiteName: string
}

async function getMetaByUrl(url: string): Promise<PageMeta> {
    if (url === '/') {
        return {
            title: 'Quantum Evolution',
            description: 'Помогаем педагогам и детям находить друг друга, создавать интересные проекты, подбирать места для проведения встреч',
            ogTitle: 'Интересные проекты и идеи для детей рядом',
            ogDescription: 'Помогаем педагогам и детям находить друг друга, создавать интересные проекты, подбирать места для проведения встреч',
            ogImage: 'https://q2-dev.ru/forIndex.png',
            ogType: 'article',
            ogSiteName: 'Quantum',
        }
    }

    if (url === '/idea') {
        return {
            title: 'Quantum | Для родителей',
            description: 'Помогаем родителям подобрать для ребенка интересный проект: секцию, кружок, мастер класс или предложить идею нового уникального проекта',
            ogTitle: 'Реализовать идею проекта ребенка',
            ogDescription: 'Помогаем родителям подобрать для ребенка интересный проект: секцию, кружок, мастер класс или предложить идею нового уникального проекта',
            ogImage: 'https://q2-dev.ru/forParent.png',
            ogType: 'article',
            ogSiteName: 'Quantum | Для родителей',
        }
    }

    if (url === '/project') {
        return {
            title: 'Quantum | Для педагогов',
            description: 'Помогаем педагогам развивать детские проекты: набирать детей в группы, подбирать места для проведения встреч, вести учет посещаемости и оплаты занятий',
            ogTitle: 'Организовать детский проект',
            ogDescription: 'Помогаем педагогам развивать детские проекты: набирать детей в группы, подбирать места для проведения встреч, вести учет посещаемости и оплаты занятий',
            ogImage: 'https://q2-dev.ru/forTeacher.png',
            ogType: 'article',
            ogSiteName: 'Quantum | Для педагогов',
        }
    }

    const projectMatch = url.match(/^\/project\/([^/]+)/)

    if (projectMatch) {
        const projectId = projectMatch[1]

        const response = await fetch(`http://localhost:4000/meta/project/${projectId}`)
        const projectMeta = await response.json()

        return {
            title: projectMeta.title,
            description: projectMeta.description,
            ogTitle: projectMeta.ogTitle,
            ogDescription: projectMeta.ogDescription,
            ogImage: projectMeta.ogImage,
            ogType: projectMeta.ogType ?? 'article',
            ogSiteName: projectMeta.ogSiteName ?? 'Quantum',
        }
    }

    return {
        title: 'Quantum',
        description: 'Quantum',
        ogTitle: 'Quantum',
        ogDescription: 'Quantum',
        ogImage: 'https://q2-dev.ru/forIndex.png',
        ogType: 'website',
        ogSiteName: 'Quantum',
    }
}

export async function render(url: string) {
    const meta = await getMetaByUrl(url)
    const queryClient = new QueryClient()

    const html = renderToString(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <StaticRouter location={url}>
                    <App />
                </StaticRouter>
            </QueryClientProvider>
        </React.StrictMode>,
    )

    return {
        html,
        meta,
    }
}