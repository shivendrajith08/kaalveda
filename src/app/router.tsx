import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'

const LandingPage = lazy(() => import('@/features/landing/LandingPage'))
const ExplorePage = lazy(() => import('@/features/explore/ExplorePage'))
const CategoryPage = lazy(() => import('@/features/category/CategoryPage'))
const ArticlePage = lazy(() => import('@/features/article/ArticlePage'))
const TimelinePage = lazy(() => import('@/features/timeline/TimelinePage'))
const GraphCanvas = lazy(() => import('@/features/graph/GraphCanvas'))
const AboutPage = lazy(() => import('@/features/about/AboutPage'))
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'))

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
