'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Machine {
  name: string
  speed: string
  marking?: string
  drilling?: string
}

interface Competitor {
  id: string
  company: string
  country: string
  website: string
  threat: 'LOW' | 'MODERATE' | 'HIGH'
  machines: Machine[]
}

const competitors: Competitor[] = [
  {
    id: 'ceres',
    company: 'Ceres Wuhan Laser',
    country: 'China',
    website: 'https://www.jceres.com/',
    threat: 'MODERATE',
    machines: [
      { name: 'CER-D30MV Lab Laser Drill', speed: '6 tablets/use' },
      { name: 'CER-D100A One Side LD', speed: '50,000 pph' },
      { name: 'CER-D100A-II 2 Side', speed: '50,000 pph' },
      { name: 'CER-D100A-III', speed: '50,000 pph' },
      { name: 'CERES-YBA Printer', speed: '50,000 pph' }
    ]
  },
  {
    id: 'cms',
    company: 'CMS Laser',
    country: 'USA - Florida',
    website: 'www.CMSLaser.com',
    threat: 'HIGH',
    machines: [
      { name: 'TD-10', speed: '10,000 pph', marking: '10,000 pph', drilling: '10,000 pph' },
      { name: 'TD-70', speed: '70,000 pph', marking: '70,000 pph', drilling: '70,000 pph' },
      { name: 'TD-140', speed: '140,000 pph', marking: '140,000 pph', drilling: '140,000 pph' }
    ]
  },
  {
    id: 'printing-intl',
    company: 'Printing International',
    country: 'Belgium',
    website: 'www.printinginternational.com/',
    threat: 'LOW',
    machines: [
      { name: 'Agate Labo', speed: '20,000 pph' },
      { name: 'Zaherite SCL', speed: '50,000 pph' },
      { name: 'Agate MBP', speed: '400,000 pph' },
      { name: 'Zaherite DCL XL', speed: '700,000 pph' }
    ]
  },
  {
    id: 'enclony',
    company: 'Enclony',
    country: 'South Korea',
    website: 'www.enclony.com/',
    threat: 'MODERATE',
    machines: [
      { name: 'Planet LPI-TC', speed: 'Multi-product' },
      { name: 'Planet LPI-T', speed: '400,000 pph (5mm)' },
      { name: 'Planet LPI-C', speed: '200,000 pph (10mm)' },
      { name: 'Planet LP-T', speed: '90,000-150,000 pph' },
      { name: 'Planet LP-C', speed: 'Variable' }
    ]
  },
  {
    id: 'qualicaps',
    company: 'Qualicaps',
    country: 'Japan',
    website: 'https://en.qualicaps.co.jp/product',
    threat: 'MODERATE',
    machines: [
      { name: 'Qualis-UVS/UVD', speed: 'UV Laser' },
      { name: 'LIS-250D/LIS-Labo', speed: '250,000 pph' },
      { name: 'Qualis Lite CO2', speed: '90,000-200,000 pph' },
      { name: 'IMS 400i', speed: '250,000-400,000 pph' },
      { name: 'QUALIS-Pro', speed: '3D Inspection (New)' }
    ]
  },
  {
    id: 'yenchen',
    company: 'Yenchen',
    country: 'Taiwan',
    website: 'https://www.yenchen.com.tw/',
    threat: 'MODERATE',
    machines: [
      { name: 'LDM-101 Laser Drill', speed: '20,000-30,000 pph' }
    ]
  },
  {
    id: 'tri-star',
    company: 'Tri-Star Technologies',
    country: 'USA - California',
    website: 'www.tri-star-technologies.com/',
    threat: 'LOW',
    machines: [
      { name: 'UV Cold Laser Systems', speed: 'Custom' }
    ]
  }
]

const ackleyMachines = [
  { name: 'LL-5000', speed: '5,000-7,000 pph' },
  { name: 'R&D Laser', price: '$160,160', speed: '5,000 pph' },
  { name: 'Delta', price: '$171,600', speed: '50,000-70,000 pph' },
  { name: 'VIP', price: '$161,260', speed: '50,000-60,000 pph' },
  { name: 'Servo Drum', price: '$404,560', speed: '120,000 pph' },
  { name: 'H-Track', speed: '120,000-180,000 pph' },
  { name: 'GPS', speed: '180,000-225,000 pph' },
  { name: 'Cantilever Ramp', speed: '250,000 pph' },
  { name: 'IBM / Model B', price: '$394,872', speed: '250,000-300,000 pph' },
  { name: 'Model C', speed: '300,000 pph' },
  { name: 'Adjustable Ramp', speed: '800,000 pph' }
]

const getThreatColor = (threat: string) => {
  switch (threat) {
    case 'HIGH':
      return 'border-red-500 bg-red-50'
    case 'MODERATE':
      return 'border-yellow-500 bg-yellow-50'
    case 'LOW':
      return 'border-green-500 bg-green-50'
    default:
      return 'border-gray-300'
  }
}

const getThreatBadge = (threat: string) => {
  switch (threat) {
    case 'HIGH':
      return 'bg-red-200 text-red-800'
    case 'MODERATE':
      return 'bg-yellow-200 text-yellow-800'
    case 'LOW':
      return 'bg-green-200 text-green-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

export default function CompetitorsPage() {
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)
  const [selectedThreatFilter, setSelectedThreatFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL')

  const filteredCompetitors = selectedThreatFilter === 'ALL'
    ? competitors
    : competitors.filter(c => c.threat === selectedThreatFilter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Competitive Landscape Analysis</h1>
          <p className="text-blue-100 text-lg">
            Ackley Hartnett vs. Global Competitors
          </p>
          <p className="text-blue-100 text-sm mt-2">
            Research Date: June 2026 | 8 Competitors Analyzed | 6 Technology Segments
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Ackley Overview */}
        <div className="bg-white border-l-4 border-blue-600 rounded-lg p-8 mb-12 shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ackley Hartnett Portfolio</h2>
          <p className="text-gray-600 mb-6">
            Market leader in pharmaceutical tablet identification systems with complete integrated solutions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ackleyMachines.map((machine, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-semibold text-gray-800">{machine.name}</p>
                <p className="text-sm text-gray-600 mt-1">Speed: {machine.speed}</p>
                {machine.price && <p className="text-sm text-blue-600 font-semibold">{machine.price}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedThreatFilter('ALL')}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedThreatFilter === 'ALL'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Competitors
          </button>
          <button
            onClick={() => setSelectedThreatFilter('HIGH')}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedThreatFilter === 'HIGH'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            High Threat
          </button>
          <button
            onClick={() => setSelectedThreatFilter('MODERATE')}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedThreatFilter === 'MODERATE'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Moderate Threat
          </button>
          <button
            onClick={() => setSelectedThreatFilter('LOW')}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedThreatFilter === 'LOW'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Low Threat
          </button>
        </div>

        {/* Competitor Cards */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCompetitors.map((competitor) => (
            <div
              key={competitor.id}
              className={`border-2 rounded-lg overflow-hidden shadow-lg transition hover:shadow-xl ${getThreatColor(
                competitor.threat
              )}`}
            >
              <div
                onClick={() =>
                  setExpandedCompetitor(
                    expandedCompetitor === competitor.id ? null : competitor.id
                  )
                }
                className="cursor-pointer p-6 flex items-center justify-between bg-white bg-opacity-70"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{competitor.company}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getThreatBadge(competitor.threat)}`}>
                      {competitor.threat} Threat
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {competitor.country} | <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{competitor.website}</a>
                  </p>
                </div>
                <div className="text-2xl">
                  {expandedCompetitor === competitor.id ? '−' : '+'}
                </div>
              </div>

              {expandedCompetitor === competitor.id && (
                <div className="bg-white bg-opacity-50 p-6 border-t-2">
                  <h4 className="font-bold text-gray-800 mb-4">Machine Models:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitor.machines.map((machine, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border border-gray-300">
                        <p className="font-semibold text-gray-800">{machine.name}</p>
                        <p className="text-sm text-gray-600 mt-2">Speed: {machine.speed}</p>
                        {machine.marking && <p className="text-sm text-gray-600">Marking: {machine.marking}</p>}
                        {machine.drilling && <p className="text-sm text-gray-600">Drilling: {machine.drilling}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to compare more details?</h3>
          <p className="mb-6 text-blue-100">
            Talk to Kyle for machine selection guidance or Tim for technical specifications.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/kyle" className="bg-white text-blue-600 font-bold px-6 py-3 rounded hover:bg-blue-50 transition">
              Ask Kyle
            </a>
            <a href="/tim" className="bg-white text-blue-600 font-bold px-6 py-3 rounded hover:bg-blue-50 transition">
              Ask Tim
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
