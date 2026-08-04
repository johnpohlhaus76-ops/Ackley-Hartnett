"use client";

import Link from "next/link";
import { Building2, Users, Boxes, Globe2, FileText, Zap, Lightbulb, TrendingUp, Shield, Languages, Upload, Newspaper, ArrowRight, BarChart3, DollarSign } from "lucide-react";
import { portalStats } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";
import { PageBot } from "@/components/PageBot";
import { LanguageSelector } from "@/components/LanguageSelector";
import "@/styles/pharmaceutical.css";

export default function DashboardPage() {
  const s = portalStats();
  const { t } = useTranslation();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        padding: '24px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1E5BA8', margin: 0 }}>Ackley-Hartnett</h1>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link href="/portal" style={{ color: '#2C2C2C', textDecoration: 'none', fontWeight: 500 }}>{t('nav.dashboard', 'Dashboard')}</Link>
            <Link href="/portal/accounts" style={{ color: '#2C2C2C', textDecoration: 'none', fontWeight: 500 }}>{t('nav.accounts', 'Accounts')}</Link>
            <Link href="/portal/catalog" style={{ color: '#2C2C2C', textDecoration: 'none', fontWeight: 500 }}>{t('nav.catalog', 'Catalog')}</Link>
            <Link href="/portal/quote" style={{ color: '#2C2C2C', textDecoration: 'none', fontWeight: 500 }}>{t('nav.quotes', 'Quotes')}</Link>
            <LanguageSelector />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>{t('dashboard.title', 'Sales Operations')}</h1>
          <p style={{ fontSize: '15px', color: '#999999', margin: 0 }}>{t('dashboard.subtitle', 'Global view of accounts and equipment')}</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {[
            { label: 'nav.accounts', value: formatNumber(s.accounts), icon: '🏢' },
            { label: 'price.bitcoin', value: formatNumber(s.contacts), icon: '👥' },
            { label: 'nav.catalog', value: formatNumber(s.installs), icon: '⚙️' },
            { label: 'price.gold', value: formatNumber(s.countries), icon: '🌍' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E8E8',
              borderRadius: '4px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ fontSize: '15px', color: '#999999', marginBottom: '8px' }}>{t(stat.label, stat.label)}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', marginBottom: '24px' }}>{t('nav.tools', 'Tools')}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {[
              { href: '/portal/master', label: 'Wei Lin Avatar', icon: Zap },
              { href: '/portal/market-data', label: 'Market Data', icon: BarChart3 },
              { href: '/portal/tariffs', label: 'US Tariffs', icon: DollarSign },
              { href: '/portal/upload', label: 'Media Center', icon: Upload },
            ].map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.href} href={tool.href} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8E8',
                  borderRadius: '4px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: '#2C2C2C',
                  transition: 'all 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div><IconComponent size={24} color="#1E5BA8" /></div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{tool.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bot */}
      <PageBot context="dashboard" />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
        padding: '64px 32px',
        marginTop: '64px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          © 2026 Ackley-Hartnett. Available in 19 languages.
        </p>
      </footer>
    </div>
  );
}
