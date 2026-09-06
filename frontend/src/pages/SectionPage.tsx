import { useParams, Navigate } from 'react-router-dom'
import SectionView from './SectionView'
import { SECTIONS } from '../types/nyt'
import type { SectionName } from '../types/nyt'

export default function SectionPage() {
  const { sectionName } = useParams<{ sectionName: string }>()
  const isValid = SECTIONS.some((s) => s.key === sectionName)

  if (!sectionName || !isValid) {
    return <Navigate to="/404" replace />
  }

  return <SectionView section={sectionName as SectionName} />
}
