import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { lazyWithRetry } from '@/app/lazyWithRetry'

const LandingPage = lazyWithRetry(() => import('@/features/landing/LandingPage'))
const ExplorePage = lazyWithRetry(() => import('@/features/explore/ExplorePage'))
const CategoryPage = lazyWithRetry(() => import('@/features/category/CategoryPage'))
const ArticlePage = lazyWithRetry(() => import('@/features/article/ArticlePage'))
const TimelinePage = lazyWithRetry(() => import('@/features/timeline/TimelinePage'))
const GraphCanvas = lazyWithRetry(() => import('@/features/graph/GraphCanvas'))
const AboutPage = lazyWithRetry(() => import('@/features/about/AboutPage'))
const NotFoundPage = lazyWithRetry(() => import('@/features/misc/NotFoundPage'))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="category/:id" element={<CategoryPage />} />
        <Route path="article/:id" element={<ArticlePage />} />
        <Route path="timeline/:id" element={<TimelinePage />} />
        <Route path="graph" element={<GraphCanvas />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
